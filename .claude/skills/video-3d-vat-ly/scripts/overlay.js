// overlay.js: thư viện lớp phủ 2D cho video 3D giải thích hiện tượng (canvas 1080×1920, nền tối, nét phát sáng).
// Chép file này vào thư mục video (cạnh video.html) rồi nạp SAU khi đã khai báo SHOTS, CAPS:
//   <script> const SHOTS = [...]; const CAPS = [...]; </script>
//   <script src="overlay.js"></script>
//   <script> ...explain(t), renderAt... </script>
// SHOTS: [{ id: 'S1', t0: 0, t1: 5, n: 121 }]  (n = số khung đã xuất, khung nằm ở frames/<id>/0000.jpg…, 24 hình/giây)
// CAPS:  [[t0, t1, 'câu phụ đề'], ...]           (phụ đề hiện từng cụm 3–5 chữ theo thời gian đọc)

const W = 1080, H = 1920, FPS3D = 24;
const cv = document.getElementById('c'); cv.width = W; cv.height = H; const ctx = cv.getContext('2d');
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const fade = (t, a, b, d = 0.4) => seg(t, a, a + d) * (1 - seg(t, b - d, b));   // hiện ở a, tắt ở b
const SANS = '"Be Vietnam Pro", sans-serif', SERIF = '"Noto Serif", Georgia, serif';

// Màu đại lượng trên nền tối (cùng thứ tự với bảng màu của kênh, sáng hơn để nổi trên nền đen)
const Q = { F: '#FF4D6D', v: '#22C7E8', a: '#B66DFF', E: '#FBBF24', B: '#4ADE80', i: '#FBBF24', I: '#FB923C', heat: '#F43F5E', s: '#9CA3AF', white: '#F2F2F2' };
const ACCENT = '#FF8A3D';   // một điểm nhấn cam mỗi khung (đáp số, chữ quan trọng)

// ===== Hạt phim + tối viền =====
const _grains = [0, 1, 2, 3].map((k) => { const g = document.createElement('canvas'); g.width = 540; g.height = 960; const c = g.getContext('2d');
  const im = c.createImageData(540, 960); for (let i = 0; i < 540 * 960; i++) { const v = 128 + (hash(i * 1.7 + k * 99991) - 0.5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
  c.putImageData(im, 0, 0); return g; });
const _vig = (() => { const g = document.createElement('canvas'); g.width = W; g.height = H; const c = g.getContext('2d');
  const r = c.createRadialGradient(W / 2, H * 0.45, H * 0.25, W / 2, H * 0.5, H * 0.75); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = r; c.fillRect(0, 0, W, H); return g; })();
function film(t, grain = 0.07) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = grain; ctx.drawImage(_grains[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
  ctx.drawImage(_vig, 0, 0);
}
function clearFrame(color = '#0E0F11') { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
// Chuyển cảnh qua màu đen tại các mốc (giữa 3D và 2D)
function dips(t, marks, d = 0.4) { const k = Math.max(0, ...marks.map((a) => 1 - Math.abs(clamp((t - a) / d, -1, 1)))); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k})`; ctx.fillRect(0, 0, W, H); } }

// ===== Chữ =====
function txt(s, x, y, o = {}) {
  ctx.save(); const sz = o.size || 44; ctx.font = `${o.w || 700} ${sz}px ${o.font || SANS}`; if (o.ls) ctx.letterSpacing = o.ls + 'px';
  if (o.max) { const w = ctx.measureText(s).width; if (w > o.max) ctx.font = `${o.w || 700} ${Math.floor(sz * o.max / w)}px ${o.font || SANS}`; }
  ctx.fillStyle = o.color || Q.white; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.globalAlpha = (o.alpha ?? 1) * ctx.globalAlpha;
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 18; }
  if (o.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.85)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 2; }
  ctx.fillText(s, x, y); ctx.restore();
}
// Phụ đề điện ảnh: chữ có chân trắng, không khung, hiện từng cụm. y mặc định 1500 (trên vùng nút bấm TikTok).
function subtitle(t, y = 1500) {
  const c = CAPS.find(([a, b]) => t >= a && t < b); if (!c) return;
  const words = c[2].split(' '); const chunks = []; let cur = [];
  words.forEach((w, i) => { cur.push(w); const punct = /[,.:;!?]$/.test(w); if (cur.length >= 5 || (punct && cur.length >= 2) || i === words.length - 1) { chunks.push(cur.join(' ')); cur = []; } });
  const total = chunks.reduce((s, x) => s + x.length + 6, 0); let acc = 0; const q = (t - c[0]) / (c[1] - c[0]);
  let show = chunks[chunks.length - 1], start = 0;
  for (const ch of chunks) { const len = (ch.length + 6) / total; if (q < acc + len) { show = ch; start = acc; break; } acc += len; }
  txt(show, W / 2, y, { size: 50, w: 700, font: SERIF, shadow: true, alpha: clamp((q - start) * (c[1] - c[0]) / 0.12), max: 960 });
}
// Nhãn mảnh kiểu phim tài liệu (gọi tên vật, hiện tượng trên cảnh 3D). Đặt ở x ≥ 100, tránh cột nút bên phải (x > 940, y > 900).
function tag(s, x, y, p, color = Q.white) {
  if (p <= 0) return; ctx.save(); ctx.globalAlpha = easeOut(p); ctx.font = `600 32px ${SANS}`; const w = ctx.measureText(s).width;
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(x - 14, y - 26, w + 28, 52); ctx.fillStyle = color; ctx.fillRect(x - 14, y - 26, 4, 52); ctx.restore();
  txt(s, x, y + 1, { size: 32, w: 600, align: 'left', alpha: easeOut(p), color });
}

// ===== Khung 3D =====
const _cache = new Map();
function loadImg(src) { if (_cache.has(src)) return _cache.get(src); const im = new Image(); const p = new Promise((res) => { im.onload = () => res(im); im.onerror = () => res(null); }); im.src = src; _cache.set(src, p); if (_cache.size > 10) _cache.delete(_cache.keys().next().value); return p; }
const frameSrc = (sh, local) => `frames/${sh.id}/${String(Math.min(sh.n - 1, Math.max(0, Math.round(local * FPS3D)))).padStart(4, '0')}.jpg`;
// Vẽ khung 3D nếu t nằm trong một cảnh; hai cảnh 3D liền nhau thì mờ chồng `xfade` giây. Trả về cảnh đang chiếu (hoặc null).
async function draw3D(t, xfade = 0.35) {
  const i = SHOTS.findIndex((s) => t >= s.t0 && t < s.t1); if (i < 0) return null; const sh = SHOTS[i];
  const im = await loadImg(frameSrc(sh, t - sh.t0));
  if (im) ctx.drawImage(im, 0, 0, W, H); else { ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H); txt('chưa có khung 3D ' + sh.id, W / 2, H / 2, { size: 30 }); }
  const prev = SHOTS[i - 1];
  if (prev && prev.t1 === sh.t0 && t - sh.t0 < xfade) { const pim = await loadImg(frameSrc(prev, prev.t1 - prev.t0)); if (pim) { ctx.save(); ctx.globalAlpha = 1 - (t - sh.t0) / xfade; ctx.drawImage(pim, 0, 0, W, H); ctx.restore(); } }
  return sh;
}
// Hơi nước, khói mờ bốc lên (vùng x0..x1, đáy y0)
function steam(t, a, x0 = 330, x1 = 750, y0 = 620) {
  if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let k = 0; k < 14; k++) { const ph = ((t * 0.35 + hash(k)) % 1); const x = x0 + hash(k * 3) * (x1 - x0) + Math.sin(t * 0.8 + k) * 40, y = y0 - ph * 520, r = 60 + ph * 140;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${0.09 * a * Math.sin(ph * Math.PI)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.restore();
}

// ===== Công thức TeX (SVG sắp sẵn bằng scripts/tex.js vào thư mục tex/) =====
const TEX = {};
function loadTex(names) { return Promise.all(names.map((n) => new Promise((res) => { const im = new Image(); im.onload = () => { TEX[n] = im; res(); }; im.onerror = () => { console.error('thiếu tex/' + n + '.svg'); res(); }; im.src = 'tex/' + n + '.svg'; }))); }
function loadFonts() { return Promise.all(['500 40px "Be Vietnam Pro"', '600 40px "Be Vietnam Pro"', '700 40px "Be Vietnam Pro"', '800 40px "Be Vietnam Pro"', '700 40px "Noto Serif"'].map((f) => document.fonts.load(f))); }
// Vẽ công thức tâm (x, y), cao h px, hiện dần theo p (0→1)
function formula(name, x, y, h, p, glow = true) {
  const im = TEX[name]; if (!im || p <= 0) return; const s = h / im.height, w = im.width * s, hh = im.height * s;
  ctx.save(); ctx.globalAlpha *= easeOut(p); if (glow) { ctx.shadowColor = 'rgba(255,255,255,0.35)'; ctx.shadowBlur = 16; } ctx.drawImage(im, x - w / 2, y - hh / 2, w, hh); ctx.restore();
}

// ===== Nét phát sáng: mũi tên, kí hiệu, đồ thị =====
function glowLine(draw, color, w = 5, blur = 16) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.beginPath(); draw(); ctx.stroke(); ctx.restore(); }
function arrowHead(x, y, ang, color, size = 16) { ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(size, 0); ctx.lineTo(-size * 0.7, -size * 0.6); ctx.lineTo(-size * 0.7, size * 0.6); ctx.closePath(); ctx.fill(); ctx.restore(); }
// Vectơ đại lượng: mọc dài dần theo p, nhãn (vd 'F', 'v') đặt cạnh đầu mũi tên. Độ dài phải tỉ lệ với độ lớn thật.
function vec(x1, y1, x2, y2, color, p = 1, label = '', o = {}) {
  if (p <= 0) return; const ex = lerp(x1, x2, easeOut(p)), ey = lerp(y1, y2, easeOut(p)), L = Math.hypot(ex - x1, ey - y1); if (L < 4) return;
  const a = Math.atan2(ey - y1, ex - x1), w = o.w || 7, hd = w * 2.6;
  glowLine(() => { ctx.moveTo(x1, y1); ctx.lineTo(ex - Math.cos(a) * hd * 0.6, ey - Math.sin(a) * hd * 0.6); }, color, w, 14);
  arrowHead(ex - Math.cos(a) * hd * 0.3, ey - Math.sin(a) * hd * 0.3, a, color, hd);
  if (label) { const nx = -Math.sin(a), ny = Math.cos(a), side = o.side || 1, off = o.off || 34;
    txt(label, ex + nx * off * side + Math.cos(a) * 10, ey + ny * off * side + Math.sin(a) * 10, { size: o.size || 42, w: 800, font: SERIF, color, glow: color, blur: 10, alpha: clamp(p * 2 - 1) }); }
}
// ⊙ (dòng điện, đường sức đi ra khỏi màn hình) hoặc ⊗ (đi vào)
function sym(x, y, dot, color, a = 1, r = 17) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 4; ctx.shadowColor = color; ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  if (dot) { ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, 7); ctx.fill(); } else { const k = r * 0.6; ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke(); }
  ctx.restore(); }
// Hệ trục có mũi tên + nhãn. Trả về hàm đổi toạ độ {X(x), Y(y)} để vẽ đường.
function axes(x0, y0, w, h, o = {}) {
  const p = o.p ?? 1, xl = o.xl || 't', yl = o.yl || '', x0v = o.xmin ?? 0, x1v = o.xmax ?? 1, y0v = o.ymin ?? -1, y1v = o.ymax ?? 1;
  const X = (x) => x0 + ((x - x0v) / (x1v - x0v)) * w, Y = (y) => y0 + h - ((y - y0v) / (y1v - y0v)) * h, yz = clamp(Y(0), y0, y0 + h);
  if (p > 0) { ctx.save(); ctx.globalAlpha *= 0.6 * easeOut(p); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, yz); ctx.lineTo(x0 + w * easeOut(p), yz); ctx.moveTo(x0, y0 + h); ctx.lineTo(x0, y0 + h - h * easeOut(p)); ctx.stroke(); ctx.restore();
    arrowHead(x0 + w * easeOut(p) + 6, yz, 0, 'rgba(255,255,255,0.6)', 12); arrowHead(x0, y0 + h - h * easeOut(p) - 6, -Math.PI / 2, 'rgba(255,255,255,0.6)', 12);
    txt(xl, x0 + w + 26, yz + 34, { size: 32, w: 600, font: SERIF, alpha: 0.75 * p, align: 'right' }); if (yl) txt(yl, x0 + 16, y0 - 22, { size: 32, w: 600, font: SERIF, alpha: 0.75 * p, align: 'left' }); }
  return { X, Y };
}
// Vẽ đồ thị y = f(x) trên hệ trục ax, chạy dần tới xEnd. o.dash: nét đứt (đường so sánh).
function plot(ax, f, xa, xEnd, color, o = {}) {
  if (xEnd <= xa) return; const n = o.n || 200;
  ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha; if (o.dash) ctx.setLineDash(o.dash);
  glowLine(() => { for (let i = 0; i <= n; i++) { const x = lerp(xa, xEnd, i / n), X = ax.X(x), Y = ax.Y(f(x)); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } }, color, o.w || 5, o.dash ? 0 : 12);
  ctx.restore();
  if (o.dot) { ctx.save(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(ax.X(xEnd), ax.Y(f(xEnd)), 9, 0, 7); ctx.fill(); ctx.restore(); }
}
// Ghi chú trung thực bắt buộc khi hình phóng đại, làm chậm, hoặc số liệu chỉ để minh hoạ
function note(s, x = W / 2, y = 1390, a = 1) { txt(s, x, y, { size: 24, w: 500, alpha: 0.55 * a, align: 'center' }); }
// Thẻ khung viền phát sáng (tóm tắt chuỗi nguyên nhân → kết quả)
function chain(rows, t, t0, y0 = 520, gap = 210, step = 0.9) {
  rows.forEach(([s, c], k) => { const p = seg(t, t0 + k * step, t0 + 0.5 + k * step); if (p <= 0) return; const y = y0 + k * gap;
    ctx.save(); ctx.globalAlpha = easeOut(p); ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.shadowColor = c; ctx.shadowBlur = 18; ctx.beginPath(); ctx.roundRect(130, y - 60, 820, 120, 18); ctx.stroke(); ctx.restore();
    txt(s, W / 2, y, { size: 40, w: 700, color: c, alpha: easeOut(p), max: 760 });
    if (k > 0) { ctx.save(); ctx.globalAlpha = easeOut(p); glowLine(() => { ctx.moveTo(W / 2, y - gap + 70); ctx.lineTo(W / 2, y - 76); }, '#fff', 3, 8); arrowHead(W / 2, y - 72, Math.PI / 2, '#fff', 12); ctx.restore(); } });
}
function endCard(t, t0, channel, slogan, next) {
  const u = t - t0; txt(channel, W / 2, 820, { size: 72, w: 800, alpha: seg(u, 0.1, 0.6), max: 900 });
  txt(slogan, W / 2, 900, { size: 34, w: 500, alpha: 0.7 * seg(u, 0.3, 0.8), max: 900 });
  ctx.save(); ctx.globalAlpha = seg(u, 0.5, 1.0); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(W / 2 - 260, 990, 520, 100, 50); ctx.stroke(); ctx.restore();
  txt('Theo dõi kênh', W / 2, 1041, { size: 42, w: 700, alpha: seg(u, 0.5, 1.0) });
  if (next) txt(next, W / 2, 1180, { size: 34, w: 600, font: SERIF, alpha: 0.85 * seg(u, 0.9, 1.4), max: 920 });
}
// góc trên phải, dưới vùng 150 px đầu (cột phải phía dưới bị nút TikTok che)
function watermark(handle) { txt(handle, W - 50, 200, { size: 26, w: 600, align: 'right', alpha: 0.28 }); }
