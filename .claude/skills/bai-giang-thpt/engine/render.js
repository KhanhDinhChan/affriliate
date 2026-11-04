#!/usr/bin/env node
// Dựng video bài giảng: node render.js <scene.js> [out.mp4] [--stills 2,8,15] [--size 1920x1080]
// Mặc định khổ dọc 1080×1920 (TikTok, Shorts, Reels); --size 1920x1080 để xuất bản YouTube ngang.
//  - Công thức viết bằng TeX (MathJax, có mhchem cho Hoá) được sắp chữ thành SVG ngay trên máy, không cần mạng.
//  - Ảnh tư liệu, bản đồ (Natural Earth), dòng thời gian cho KHXH.
//  - Giọng đọc quyết định thời gian: beat có file giọng thì dài đúng bằng file đó.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const stills = opt('--stills'); const sizeOpt = opt('--size');
const [sceneArg, outArg] = argv;
if (!sceneArg) { console.error('Dùng: node render.js <scene.js> [out.mp4] [--stills 2,8] [--size 1920x1080]'); process.exit(1); }

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  try { return require(path.join(__dirname, 'node_modules', 'playwright')); } catch {}
  console.error('Thiếu playwright: cd ' + __dirname + ' && npm install playwright && npx playwright install chromium'); process.exit(1);
}
const probe = (f) => parseFloat(String(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f])));

// ===== Sắp chữ công thức =====
const MJ = (() => {
  const { mathjax } = require('mathjax-full/js/mathjax.js');
  const { TeX } = require('mathjax-full/js/input/tex.js');
  const { SVG } = require('mathjax-full/js/output/svg.js');
  const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
  const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
  const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');
  const adaptor = liteAdaptor(); RegisterHTMLHandler(adaptor);
  const docs = {}; const COLORS = {};
  return (tex, mode) => {
    if (!docs[mode]) {
      const C = mode === 'khxh'
        ? { F: '#E11D48', v: '#0891B2', a: '#7C3AED', E: '#B45309', B: '#15803D', hl: '#C2410C', sub: '#0F766E' }
        : { F: '#FF6B85', v: '#38D3EE', a: '#C08BFF', E: '#FFD15C', B: '#4BE08E', hl: '#FF9A3D', sub: '#34D399' };
      // \cF{..} lực, \cV vận tốc, \cA gia tốc, \cE điện trường/năng lượng, \cB từ trường, \hl nhấn mạnh.
      // Dùng tên màu tạm (qf, qv…) rồi thay bằng mã màu sau khi sắp chữ — vì dấu # xung đột với tham số macro.
      const macros = {}; COLORS[mode] = {};
      for (const [k, v] of Object.entries({ cF: C.F, cV: C.v, cA: C.a, cE: C.E, cB: C.B, hl: C.hl })) { const nm = 'qq' + k.toLowerCase(); macros[k] = [`{\\color{${nm}}{#1}}`, 1]; COLORS[mode][nm] = v; }
      docs[mode] = mathjax.document('', { InputJax: new TeX({ packages: AllPackages, macros }), OutputJax: new SVG({ fontCache: 'none' }) });
    }
    let svg = adaptor.innerHTML(docs[mode].convert(tex, { display: true }));
    for (const [nm, hex] of Object.entries(COLORS[mode])) svg = svg.split(`"${nm}"`).join(`"${hex}"`);
    return svg;
  };
})();

function svgFormula(tex, color, sizePx, mode) {
  let s = MJ(tex, mode);
  const vb = s.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!vb) throw new Error('Không sắp chữ được công thức: ' + tex);
  if (/data-mjx-error|merror/.test(s)) throw new Error('Lỗi cú pháp TeX: ' + tex);
  const w = (parseFloat(vb[3]) / 1000) * sizePx, h = (parseFloat(vb[4]) / 1000) * sizePx;
  s = s.replace(/ width="[^"]+"/, ` width="${w.toFixed(1)}"`).replace(/ height="[^"]+"/, ` height="${h.toFixed(1)}"`)
    .replace(/currentColor/g, color).replace(/style="[^"]*"/, '');
  return 'data:image/svg+xml;base64,' + Buffer.from(s).toString('base64');
}

// ===== Bản đồ: lấy các nước nằm trong khung nhìn =====
function mapData(views) {
  if (!views.length) return [];
  const topo = require('topojson-client'); const world = require('world-atlas/countries-50m.json');
  const fc = topo.feature(world, world.objects.countries);
  let [x0, y0, x1, y1] = [180, 90, -180, -90];
  for (const v of views) { x0 = Math.min(x0, v[0]); y0 = Math.min(y0, v[1]); x1 = Math.max(x1, v[2]); y1 = Math.max(y1, v[3]); }
  const mx = (x1 - x0) * 0.6, my = (y1 - y0) * 0.6; [x0, y0, x1, y1] = [x0 - mx, y0 - my, x1 + mx, y1 + my];
  const out = [];
  for (const f of fc.features) {
    if (!f.geometry) continue;
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const keep = [];
    for (const poly of polys) {
      const ring = poly[0]; let bx0 = 999, by0 = 999, bx1 = -999, by1 = -999;
      for (const [x, y] of ring) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); }
      if (bx1 - bx0 > 300) continue; // vòng vắt qua kinh tuyến 180 — bỏ
      if (bx1 < x0 || bx0 > x1 || by1 < y0 || by0 > y1) continue;
      keep.push(poly.map((r) => r.map(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100])));
    }
    if (keep.length) out.push({ id: f.id, name: f.properties.name, p: keep });
  }
  return out;
}

(async () => {
  const scenePath = path.resolve(sceneArg); const dir = path.dirname(scenePath);
  const scene = require(scenePath);
  const size = sizeOpt ? sizeOpt.split('x').map(Number) : scene.size || [1080, 1920]; // mặc định khổ dọc TikTok
  const SUBJ_MODE = { toan: 'khtn', ly: 'khtn', hoa: 'khtn', sinh: 'khtn', su: 'khxh', dia: 'khxh', van: 'khxh', gdktpl: 'khxh' };
  const mode = scene.mode || SUBJ_MODE[scene.subject] || 'khtn';
  const look = scene.look || 'mac-dinh'; // 'so-tay' = giao diện Sổ tay chung cho mọi môn (nền giấy sáng)
  const inkMode = look === 'so-tay' ? 'khxh' : mode; // công thức trên nền sáng dùng mực đậm
  const U = Math.min(...size) / 1080;
  const out = path.resolve(outArg || path.join(dir, 'out', path.basename(scenePath, '.js') + (sizeOpt ? '-' + sizeOpt : '') + '.mp4'));
  const work = out.replace(/\.mp4$/, '') + '_work'; fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });

  // 1. thời gian
  const gap = scene.gap ?? 0.35, rate = scene.rate ?? 4.2, endDur = scene.end === false ? 0 : scene.endDur ?? 3;
  let t = scene.lead ?? 0.3;
  const beats = scene.beats.map((b0, i) => {
    const b = JSON.parse(JSON.stringify(b0)); // bản sao chỉ chứa dữ liệu (hàm vẽ ở lại trong scene.js)
    if (!b.audio && b.say && scene.voiceDir) for (const ext of ['mp3', 'wav', 'm4a']) {
      const rel = path.join(scene.voiceDir, `${String(i).padStart(2, '0')}.${ext}`); if (fs.existsSync(path.resolve(dir, rel))) { b.audio = rel; break; }
    }
    const voice = b.audio ? probe(path.resolve(dir, b.audio)) : null;
    b.dur = b.dur ?? (voice != null ? voice + gap : (b.say ? b.say.trim().split(/\s+/).length / rate + 0.5 : 1.5) + gap);
    b.anim = Math.min(b.anim ?? b.dur * 0.85, b.dur); b.start = t; b.audioFile = b.audio ? path.resolve(dir, b.audio) : null;
    t += b.dur; return b;
  });
  const total = t + endDur;

  // 2. công thức, ảnh, bản đồ
  const images = {}; const views = [];
  const ink = look === 'so-tay' ? '#22305A' : inkMode === 'khxh' ? '#152033' : '#EEF2F8';
  const QC = inkMode === 'khxh' ? { F: '#E11D48', v: '#0891B2', a: '#7C3AED', E: '#B45309', B: '#15803D', hl: '#C2410C' } : { F: '#FF6B85', v: '#38D3EE', a: '#C08BFF', E: '#FFD15C', B: '#4BE08E', hl: '#FF9A3D' };
  const portrait = size[1] > size[0];
  for (const b of beats) for (const a of b.do || []) {
    if (a.formula !== undefined) {
      const A = { ...a, ...((portrait ? a.portrait : a.landscape) || {}) }; // cỡ riêng cho từng khổ
      const c = QC[A.color] || A.color || ink; const sz = (A.size || 64) * U;
      const key = 'tex:' + crypto.createHash('md5').update(A.formula + c + sz + inkMode).digest('hex').slice(0, 12);
      if (!images[key]) images[key] = svgFormula(A.formula, c, sz, inkMode);
      a.key = key;
      if (a.swap) { a.formulaNew = a.formula; delete a.formula; } // swap: đổi công thức đã có
    }
    if (a.image && !images[a.image]) {
      const f = path.resolve(dir, a.image); const ext = path.extname(f).slice(1).toLowerCase().replace('jpg', 'jpeg').replace('svg', 'svg+xml');
      if (fs.existsSync(f)) images[a.image] = `data:image/${ext};base64,` + fs.readFileSync(f).toString('base64');
      else { // ảnh chưa có: khung chờ ghi rõ tên file, để duyệt bố cục trước khi có ảnh tư liệu
        console.warn('  ! Chưa có ảnh, dùng khung chờ: ' + a.image);
        const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><pattern id="h" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="40" height="40" fill="#D3CAB7"/><rect width="12" height="40" fill="#C8BEA9"/></pattern></defs><rect width="1200" height="800" fill="url(#h)"/><text x="600" y="370" font-family="DejaVu Sans" font-weight="bold" font-size="76" fill="#7E735E" text-anchor="middle">ẢNH TƯ LIỆU</text><text x="600" y="450" font-family="DejaVu Sans" font-size="38" fill="#7E735E" text-anchor="middle">chờ ảnh: ${esc(a.image)}</text></svg>`;
        images[a.image] = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
      }
    }
    if ((a.map || a.mapTo) && a.view) views.push(a.view);
  }
  const map = mapData(views);

  const DATA = { size, subject: scene.subject, mode: scene.mode, look, lesson: scene.part ? `${scene.lesson} · ${scene.part}` : scene.lesson, channel: scene.channel, captions: scene.captions, beats, images, map, total, endDur };
  const sceneSrc = fs.readFileSync(scenePath, 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Pangolin&family=Patrick+Hand&family=Noto+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>html,body{margin:0;background:#000}canvas{display:block}</style></head><body><canvas id="c"></canvas>
<script>window.DATA=${JSON.stringify(DATA)};window.module={exports:{}};</script>
<script>${sceneSrc}</script><script>window.SCENE=module.exports;</script>
<script>${fs.readFileSync(path.join(__dirname, 'page.js'), 'utf8')}</script></body></html>`;
  const htmlFile = path.join(work, 'page.html'); fs.writeFileSync(htmlFile, html);

  // 3. trình duyệt
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: size[0], height: size[1] } });
  page.on('pageerror', (e) => { console.error('Lỗi trong trang:', e.message); process.exitCode = 1; });
  await page.goto('file://' + htmlFile); await page.waitForFunction(() => typeof window.renderAt === 'function'); await page.evaluate(() => window.ready);
  const canvas = page.locator('#c');
  fs.mkdirSync(path.dirname(out), { recursive: true });

  if (stills) {
    for (const s of stills.split(',').map(Number)) {
      await page.evaluate((x) => window.renderAt(x), s);
      const f = out.replace(/\.mp4$/, '') + `_${String(s).replace('.', '_')}s.png`; await canvas.screenshot({ path: f }); console.log(f);
    }
    await browser.close(); return;
  }

  // 4. âm thanh
  let audio = null; const voiced = beats.filter((b) => b.audioFile);
  if (voiced.length || scene.music) {
    audio = path.join(work, 'mix.m4a'); const args = ['-y', '-v', 'error']; const fl = []; const labs = [];
    voiced.forEach((b, i) => { args.push('-i', b.audioFile); const ms = Math.round((b.start + 0.05) * 1000); fl.push(`[${i}:a]aresample=48000,adelay=${ms}|${ms}[v${i}]`); labs.push(`[v${i}]`); });
    if (scene.music) { args.push('-stream_loop', '-1', '-i', path.resolve(dir, scene.music)); fl.push(`[${voiced.length}:a]aresample=48000,volume=${scene.musicVolume ?? 0.1},afade=t=out:st=${Math.max(0, total - 2)}:d=2[m]`); labs.push('[m]'); }
    fl.push(`${labs.join('')}amix=inputs=${labs.length}:normalize=0:duration=longest,apad=whole_dur=${total.toFixed(3)},atrim=0:${total.toFixed(3)}[a]`);
    args.push('-filter_complex', fl.join(';'), '-map', '[a]', '-c:a', 'aac', '-b:a', '160k', audio); execFileSync('ffmpeg', args, { stdio: 'inherit' });
  }

  // 5. khung hình → MP4, chụp sheet cuối mỗi beat
  const fps = scene.fps || 30; const frames = Math.ceil(total * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', ...(audio ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-c:a', 'copy'] : []),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  const sheetAt = new Map(beats.map((b, i) => [Math.min(frames - 1, Math.floor((b.start + b.dur) * fps) - 2), i]));
  for (let f = 0; f < frames; f++) {
    await page.evaluate((x) => window.renderAt(x), f / fps);
    const buf = await canvas.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (sheetAt.has(f)) fs.writeFileSync(path.join(work, `b${String(sheetAt.get(f)).padStart(3, '0')}.jpg`), buf);
    if (f % (fps * 5) === 0) process.stdout.write(`\r  khung ${f}/${frames}`);
  }
  ff.stdin.end(); await done; await browser.close();
  execFileSync('ffmpeg', ['-v', 'error', '-i', out, '-f', 'null', '-']);
  const cols = Math.min(4, beats.length), rows = Math.ceil(beats.length / cols);
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(work, 'b%03d.jpg'), '-vf', `scale=${size[0] > size[1] ? 480 : 270}:-1,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', path.join(work, 'sheet.jpg')]);
  console.log('\n'); beats.forEach((b, i) => console.log(`beat ${String(i).padStart(2)}  ${b.start.toFixed(2)}s  +${b.dur.toFixed(2)}s  ${b.audioFile ? '🔊' : '  '} ${b.say || ''}`));
  console.log(`\nVideo: ${out}  (${total.toFixed(1)}s, ${size[0]}x${size[1]}, ${audio ? 'có tiếng' : 'không tiếng'})\nSheet: ${path.join(work, 'sheet.jpg')}`);
})().catch((e) => { console.error(e.message || e); process.exit(1); });
