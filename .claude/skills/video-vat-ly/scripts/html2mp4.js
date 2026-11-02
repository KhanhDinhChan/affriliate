#!/usr/bin/env node
// Xuất một template HTML (có window.SIZE, window.DURATION, window.renderAt(t)) thành MP4.
//   node html2mp4.js <template.html> [out.mp4] [--audio voice.mp3] [--music bgm.mp3 --music-volume 0.12]
//                    [--stills 1.2,5,9]  (chỉ chụp ảnh PNG tại các mốc giây, không xuất video)
//                    [--fps 30] [--from 0 --to 15] (xuất một đoạn để xem nhanh)
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  try { return require(path.join(__dirname, 'node_modules', 'playwright')); } catch {}
  console.error('Thiếu playwright. Chạy: cd ' + __dirname + ' && npm install && npx playwright install chromium');
  process.exit(1);
}

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); if (i < 0) return d; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const audio = opt('--audio'); const music = opt('--music'); const musicVol = parseFloat(opt('--music-volume', '0.12'));
const stills = opt('--stills'); const fps = parseInt(opt('--fps', '30'), 10);
const from = parseFloat(opt('--from', '0')); const toArg = opt('--to');
const [tplArg, outArg] = argv;
if (!tplArg) { console.error('Dùng: node html2mp4.js <template.html> [out.mp4] [--audio f] [--music f] [--stills 1,5]'); process.exit(1); }
const tpl = path.resolve(tplArg);
const base = path.basename(tpl, '.html');
const out = path.resolve(outArg || path.join(path.dirname(tpl), 'out', base + '.mp4'));

(async () => {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => { console.error('Lỗi trong trang:', e.message); process.exitCode = 1; });
  await page.goto('file://' + tpl);
  await page.waitForFunction(() => typeof window.renderAt === 'function');
  await page.evaluate(() => window.ready);
  const { size, duration } = await page.evaluate(() => ({ size: window.SIZE, duration: window.DURATION }));
  await page.setViewportSize({ width: size[0], height: size[1] });
  const canvas = page.locator('#c');
  fs.mkdirSync(path.dirname(out), { recursive: true });

  if (stills) {
    for (const s of stills.split(',').map(Number)) {
      await page.evaluate((t) => window.renderAt(t), s);
      const f = path.join(path.dirname(out), `${base}_${String(s).replace('.', '_')}s.png`);
      await canvas.screenshot({ path: f });
      console.log(f);
    }
    await browser.close();
    return;
  }

  const to = Math.min(duration, toArg ? parseFloat(toArg) : duration);
  const frames = Math.round((to - from) * fps);
  const inputs = []; const filters = []; let n = 1;
  if (audio) { inputs.push('-i', path.resolve(audio)); filters.push(`[${n}:a]atrim=${from}:${to},asetpts=PTS-STARTPTS[va]`); n++; }
  if (music) { inputs.push('-stream_loop', '-1', '-i', path.resolve(music)); filters.push(`[${n}:a]volume=${musicVol},atrim=0:${to - from},afade=t=out:st=${Math.max(0, to - from - 1.5)}:d=1.5[ma]`); n++; }
  const aOut = [];
  if (audio || music) {
    const labs = [audio && '[va]', music && '[ma]'].filter(Boolean);
    filters.push(`${labs.join('')}amix=inputs=${labs.length}:normalize=0:duration=longest,apad=whole_dur=${to - from},atrim=0:${to - from}[a]`);
    aOut.push('-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[a]', '-c:a', 'aac', '-b:a', '160k');
  }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', ...inputs, ...aOut,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg exit ' + c)) : res())));
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.renderAt(t), from + f / fps);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % (fps * 3) === 0) process.stdout.write(`\r  khung ${f}/${frames}`);
  }
  ff.stdin.end(); await done; await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-i', out, '-f', 'null', '-']); // giải mã toàn bộ để chắc file không lỗi
  console.log(`\nVideo: ${out}  (${(to - from).toFixed(1)}s, ${size[0]}x${size[1]}${audio || music ? ', có tiếng' : ''})`);
})().catch((e) => { console.error(e); process.exit(1); });
