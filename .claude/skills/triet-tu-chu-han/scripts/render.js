#!/usr/bin/env node
// Dựng video triết tự: node render.js <scene.js> [out.mp4]
// - Mỗi beat = một câu thoại (say) + các hành động vẽ (do).
// - Giọng đọc quyết định thời gian: nếu beat có `audio`, độ dài beat = độ dài file + gap.
//   Không có audio thì ước lượng từ số âm tiết tiếng Việt (hoặc dùng `dur`).
// - In ra ảnh "sheet" chụp cuối mỗi beat để kiểm tra bố cục trước khi xuất bản.
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { fetchChar } = require('./fetch-char');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  try { return require(path.join(__dirname, 'node_modules', 'playwright')); } catch {}
  console.error('Thiếu playwright. Chạy: cd ' + __dirname + ' && npm install && npx playwright install chromium');
  process.exit(1);
}

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file]);
  return parseFloat(String(out));
}

// Tiếng Việt: giọng TTS đọc khoảng 4–4.5 âm tiết/giây ở tốc độ kể chuyện.
const estimate = (say, rate) => (say ? say.trim().split(/\s+/).length / rate + 0.5 : 1.5);

async function main() {
  const [sceneArg, outArg] = process.argv.slice(2);
  if (!sceneArg) { console.error('Dùng: node render.js <scene.js> [out.mp4]'); process.exit(1); }
  const scenePath = path.resolve(sceneArg);
  const dir = path.dirname(scenePath);
  const scene = require(scenePath);
  const out = path.resolve(outArg || path.join(dir, 'out', path.basename(scenePath).replace(/\.(c?js|json)$/, '') + '.mp4'));
  const size = scene.size || [1080, 1920];
  const fps = scene.fps || 30;
  const gap = scene.gap ?? 0.35;
  const rate = scene.rate ?? 4.2;
  const tail = scene.tail ?? 1.2;

  // 1. thời gian
  let t = scene.lead ?? 0.3;
  const beats = scene.beats.map((b, i) => {
    let voice = null;
    // `audio` khai báo tay, hoặc tự tìm <voiceDir>/NN.(mp3|wav|m4a) theo số thứ tự beat
    if (!b.audio && b.say && scene.voiceDir) {
      for (const ext of ['mp3', 'wav', 'm4a']) {
        const rel = path.join(scene.voiceDir, `${String(i).padStart(2, '0')}.${ext}`);
        if (fs.existsSync(path.resolve(dir, rel))) { b = { ...b, audio: rel }; break; }
      }
    }
    if (b.audio) {
      const f = path.resolve(dir, b.audio);
      if (!fs.existsSync(f)) throw new Error(`beat ${i}: không thấy ${b.audio}`);
      voice = probe(f);
    }
    const dur = b.dur ?? (voice != null ? voice + gap : estimate(b.say, rate) + gap);
    const anim = Math.min(b.anim ?? dur * 0.85, dur);
    const r = { ...b, start: t, dur, anim, audioFile: b.audio ? path.resolve(dir, b.audio) : null };
    t += dur;
    return r;
  });
  const total = t + tail;

  // 2. dữ liệu chữ: lấy mọi chữ Hán được write/show
  const need = new Set();
  for (const b of beats) for (const a of b.do || []) for (const k of ['write', 'show']) if (a[k]) for (const ch of a[k]) need.add(ch);
  const chars = {};
  for (const ch of need) chars[ch] = await fetchChar(ch, path.join(dir, 'data'));

  // 3. ảnh (cổ văn, minh hoạ...) nhúng dạng data URL
  const images = {};
  for (const b of beats) for (const a of b.do || []) if (a.image && !images[a.image]) {
    const f = path.resolve(dir, a.image);
    const ext = path.extname(f).slice(1).replace('jpg', 'jpeg').replace('svg', 'svg+xml');
    images[a.image] = `data:image/${ext};base64,` + fs.readFileSync(f).toString('base64');
  }

  const SCENE = { size, theme: scene.theme || 'paper', captions: scene.captions, beats, chars, images };
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#000}canvas{display:block}</style></head>
<body><canvas id="c"></canvas><script>window.SCENE=${JSON.stringify(SCENE)};</script><script>${fs.readFileSync(path.join(__dirname, 'page.js'), 'utf8')}</script></body></html>`;

  fs.mkdirSync(path.dirname(out), { recursive: true });
  const work = out.replace(/\.mp4$/, '') + '_work';
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  // 4. âm thanh: đặt từng câu thoại vào đúng thời điểm, trộn nhạc nền nếu có
  let audioTrack = null;
  const voiced = beats.filter((b) => b.audioFile);
  if (voiced.length || scene.music) {
    audioTrack = path.join(work, 'mix.m4a');
    const args = ['-y', '-v', 'error'];
    const filters = []; const labels = [];
    voiced.forEach((b, i) => {
      args.push('-i', b.audioFile);
      const ms = Math.round((b.start + 0.05) * 1000);
      filters.push(`[${i}:a]aresample=48000,adelay=${ms}|${ms}[v${i}]`); labels.push(`[v${i}]`);
    });
    if (scene.music) {
      args.push('-stream_loop', '-1', '-i', path.resolve(dir, scene.music));
      const mi = voiced.length;
      filters.push(`[${mi}:a]aresample=48000,volume=${scene.musicVolume ?? 0.12},afade=t=out:st=${Math.max(0, total - 1.5)}:d=1.5[m]`); labels.push('[m]');
    }
    filters.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest,apad=whole_dur=${total.toFixed(3)},atrim=0:${total.toFixed(3)}[a]`);
    args.push('-filter_complex', filters.join(';'), '-map', '[a]', '-c:a', 'aac', '-b:a', '160k', audioTrack);
    execFileSync('ffmpeg', args, { stdio: 'inherit' });
  }

  // 5. khung hình
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: size[0], height: size[1] } });
  page.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
  page.on('pageerror', (e) => { console.error('page error:', e.message); process.exitCode = 1; });
  await page.setContent(html);
  await page.waitForFunction(() => window.READY === true);
  await page.evaluate(() => document.fonts.ready);

  const frames = Math.ceil(total * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    ...(audioTrack ? ['-i', audioTrack, '-map', '0:v', '-map', '1:a', '-c:a', 'copy', '-shortest'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exit ' + c)) : res())));

  const canvas = page.locator('#c');
  const sheetAt = new Map(beats.map((b, i) => [Math.min(frames - 1, Math.floor((b.start + b.dur) * fps) - 2), i]));
  for (let f = 0; f < frames; f++) {
    await page.evaluate((tt) => window.renderAt(tt), f / fps);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (sheetAt.has(f)) fs.writeFileSync(path.join(work, `b${String(sheetAt.get(f)).padStart(3, '0')}.jpg`), buf);
    if (f % (fps * 5) === 0) process.stdout.write(`\r  khung ${f}/${frames}`);
  }
  ff.stdin.end();
  await done;
  await browser.close();

  // 6. sheet kiểm tra: ghép ảnh cuối mỗi beat
  const cols = Math.min(4, beats.length); const rows = Math.ceil(beats.length / cols);
  const sheet = path.join(work, 'sheet.jpg');
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(work, 'b%03d.jpg'),
    '-vf', `scale=${size[0] > size[1] ? 480 : 270}:-1,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', sheet]);

  console.log('\n');
  beats.forEach((b, i) => console.log(`beat ${String(i).padStart(2)}  ${b.start.toFixed(2)}s  +${b.dur.toFixed(2)}s  ${b.audioFile ? '🔊' : '  '} ${b.say || ''}`));
  console.log(`\nVideo: ${out}  (${total.toFixed(1)}s, ${size[0]}x${size[1]}, ${audioTrack ? 'có tiếng' : 'không tiếng'})`);
  console.log(`Sheet: ${sheet}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
