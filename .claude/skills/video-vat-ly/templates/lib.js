// Thư viện dùng chung cho mọi template video Vật Lý.
// Quy ước: mỗi template định nghĩa window.SIZE, window.DURATION, window.renderAt(t) — khung hình chỉ phụ thuộc t.

// ===== 1. HỆ NHẬN DIỆN — sửa ở đây là cả 3 phong cách đổi theo =====
const BRAND = {
  name: 'VẬT LÝ [TÊN TRUNG TÂM]',     // tên hiển thị ở góc trên
  handle: '@tentrungtam',            // TikTok / Facebook
  contact: 'Zalo 09xx xxx xxx',      // dòng liên hệ ở thẻ kết
  cta: 'Học thử miễn phí 1 buổi',
  // màu thương hiệu
  primary: '#2F6BFF',   // Xanh lượng tử — màu chủ đạo, logo, nút
  accent: '#FF8A1F',    // Cam năng lượng — điểm nhấn, CTA, đáp án đúng
  ink: '#0E1A2B',       // Mực — chữ trên nền sáng
  paper: '#F5F7FB',     // Giấy — nền sáng
  // BẢNG MÀU ĐẠI LƯỢNG VẬT LÝ — cố định trên mọi video, học sinh nhìn màu là biết đại lượng
  phys: {
    F: '#FF4D6D',  // lực
    v: '#22C7E8',  // vận tốc
    a: '#B66DFF',  // gia tốc
    E: '#FFC83D',  // điện trường, năng lượng
    B: '#3DDC84',  // từ trường
    s: '#9FB3C8',  // quỹ đạo, độ dời, đường phụ
  },
  font: '"Be Vietnam Pro", "DejaVu Sans", sans-serif',
  hand: '"Pangolin", "Be Vietnam Pro", sans-serif',
};

// Tải font trước khi chụp khung (html2mp4.js chờ window.ready)
window.ready = Promise.all(
  ['400 40px "Be Vietnam Pro"', '700 40px "Be Vietnam Pro"', '800 40px "Be Vietnam Pro"', '40px "Pangolin"'].map((f) => document.fonts.load(f))
).catch(() => {});

// Vùng an toàn cho TikTok / Reels / Shorts (khổ 1080×1920): giao diện app che ~150px trên cùng,
// ~20% phía dưới (tên kênh, mô tả) và cột nút bên phải từ khoảng y 900 trở xuống.
const SAFE = { top: 150, bottom: 1540, right: 940, captionY: 0.765 };

// ===== 2. TIỆN ÍCH THỜI GIAN =====
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x) => { x = clamp(x); const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
// tiến độ của một đoạn [a, b] giây
const seg = (t, a, b) => clamp((t - a) / (b - a));
// độ hiện của phần tử xuất hiện lúc a, biến mất lúc b (mờ vào/ra trong d giây)
const vis = (t, a, b = 1e9, d = 0.35) => clamp(Math.min((t - a) / d, (b - t) / d));

// ===== 3. VẼ =====
function setupCanvas() {
  const cv = document.getElementById('c');
  cv.width = window.SIZE[0]; cv.height = window.SIZE[1];
  return cv.getContext('2d');
}

function text(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.font = `${o.weight || 700} ${o.size || 56}px ${o.font || BRAND.font}`;
  ctx.fillStyle = o.color || '#fff';
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = o.baseline || 'middle';
  let str = String(s);
  if (o.maxWidth) { // tự co chữ cho vừa độ rộng (tính theo cả câu, để chữ không nhảy cỡ khi đang hiện dần)
    const full = ctx.measureText(str).width;
    if (full > o.maxWidth) ctx.font = `${o.weight || 700} ${Math.floor((o.size || 56) * o.maxWidth / full)}px ${o.font || BRAND.font}`;
  }
  if (o.reveal !== undefined) str = str.slice(0, Math.round(str.length * clamp(o.reveal)));
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = 24; }
  ctx.fillText(str, x, y);
  ctx.restore();
}

// Ngắt dòng theo độ rộng, trả về mảng dòng
function wrapLines(ctx, s, maxW) {
  const words = String(s).split(/\s+/); const lines = []; let cur = '';
  for (const w of words) {
    const tryS = cur ? cur + ' ' + w : w;
    if (ctx.measureText(tryS).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tryS;
  }
  if (cur) lines.push(cur);
  return lines;
}

function paragraph(ctx, s, x, y, maxW, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 600} ${o.size || 48}px ${o.font || BRAND.font}`;
  const lines = wrapLines(ctx, s, maxW); const lh = (o.size || 48) * (o.lh || 1.3);
  ctx.restore();
  lines.forEach((l, i) => text(ctx, l, x, y + i * lh, o));
  return lines.length * lh;
}

// Mũi tên vectơ (dùng màu BRAND.phys.*), có nhãn
function vector(ctx, x1, y1, x2, y2, color, label, o = {}) {
  const len = Math.hypot(x2 - x1, y2 - y1); if (len < 2) return;
  const p = o.progress ?? 1; const ex = lerp(x1, x2, p); const ey = lerp(y1, y2, p);
  const ang = Math.atan2(ey - y1, ex - x1); const w = o.width || 9; const head = w * 3.2;
  ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex - Math.cos(ang) * head * 0.8, ey - Math.sin(ang) * head * 0.8); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(ex, ey);
  ctx.lineTo(ex - head * Math.cos(ang - 0.42), ey - head * Math.sin(ang - 0.42));
  ctx.lineTo(ex - head * Math.cos(ang + 0.42), ey - head * Math.sin(ang + 0.42)); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (label) text(ctx, label, ex + (o.lx ?? 18) , ey + (o.ly ?? -24), { color, size: o.labelSize || 44, weight: 800, align: 'left', alpha: (o.alpha ?? 1) * clamp(p * 3 - 2), font: o.font });
}

function roundRect(ctx, x, y, w, h, r, fill, stroke, lw = 4) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

// Nhãn thương hiệu góc trên (có mặt suốt video, nằm trong vùng an toàn)
function brandBug(ctx, dark = true) {
  const [W] = window.SIZE; const y = SAFE.top + 40;
  ctx.save(); ctx.font = `800 34px ${BRAND.font}`;
  const w = ctx.measureText(BRAND.name).width + 84;
  roundRect(ctx, (W - w) / 2, y - 32, w, 64, 32, dark ? 'rgba(255,255,255,0.08)' : 'rgba(14,26,43,0.06)');
  ctx.restore();
  ctx.beginPath(); ctx.arc((W - w) / 2 + 34, y, 9, 0, Math.PI * 2); ctx.fillStyle = BRAND.accent; ctx.fill();
  text(ctx, BRAND.name, W / 2 + 12, y + 2, { size: 34, weight: 800, color: dark ? '#fff' : BRAND.ink });
}

// Nhãn tuyến nội dung (series) — mỗi tuyến một tên cố định để người xem nhận ra
function seriesTag(ctx, label, color, y = SAFE.top + 112) {
  const [W] = window.SIZE;
  ctx.save(); ctx.font = `800 30px ${BRAND.font}`; const w = ctx.measureText(label).width + 48; ctx.restore();
  roundRect(ctx, (W - w) / 2, y - 26, w, 52, 10, color);
  text(ctx, label, W / 2, y + 1, { size: 30, weight: 800, color: '#fff' });
}

// Phụ đề: nền tối bo góc, tối đa 2 dòng, nằm trong vùng 15% dưới cùng
function caption(ctx, s, dark = true) {
  if (!s) return;
  const [W, H] = window.SIZE; const size = 50;
  ctx.save(); ctx.font = `700 ${size}px ${BRAND.font}`;
  const lines = wrapLines(ctx, s, W * 0.82).slice(0, 2);
  const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 64; const lh = size * 1.3; const bh = lines.length * lh + 36;
  ctx.restore();
  const y0 = H * SAFE.captionY - bh / 2;
  roundRect(ctx, (W - bw) / 2, y0, bw, bh, 22, dark ? 'rgba(0,0,0,0.6)' : 'rgba(14,26,43,0.88)');
  lines.forEach((l, i) => text(ctx, l, W / 2, y0 + 18 + lh * (i + 0.5), { size, weight: 700, color: '#fff' }));
}

// Phụ đề theo thời gian: [[từ, đến, 'câu'], ...]
function captionAt(ctx, t, list, dark) {
  const c = list.find(([a, b]) => t >= a && t < b); if (c) caption(ctx, c[2], dark);
}

// Thanh tiến độ mảnh dưới cùng — giữ chân người xem
function progressBar(ctx, t, color = BRAND.accent) {
  const [W, H] = window.SIZE;
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, H - 10, W, 10);
  ctx.fillStyle = color; ctx.fillRect(0, H - 10, W * clamp(t / window.DURATION), 10);
}

// Thẻ kết: CTA thống nhất cho mọi video
function endCard(ctx, t, start, dark = true) {
  const [W, H] = window.SIZE; const p = easeOut(seg(t, start, start + 0.6));
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  ctx.fillStyle = dark ? 'rgba(8,14,24,0.92)' : 'rgba(245,247,251,0.96)'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const y = lerp(H * 0.5 + 60, H * 0.5, p);
  text(ctx, BRAND.name, W / 2, y - 250, { size: 64, weight: 800, color: dark ? '#fff' : BRAND.ink, alpha: p });
  text(ctx, 'Hiểu bản chất · Giải nhanh · Thi chắc điểm', W / 2, y - 165, { size: 40, weight: 600, color: dark ? '#B8C6DA' : '#51627A', alpha: p });
  const s = backOut(seg(t, start + 0.3, start + 0.9));
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, s);
  roundRect(ctx, -380, -70, 760, 140, 70, BRAND.accent);
  text(ctx, BRAND.cta, 0, 4, { size: 52, weight: 800, color: '#fff' });
  ctx.restore();
  text(ctx, BRAND.contact, W / 2, y + 160, { size: 50, weight: 700, color: dark ? '#fff' : BRAND.ink, alpha: clamp(seg(t, start + 0.6, start + 1)) });
  text(ctx, BRAND.handle, W / 2, y + 235, { size: 40, weight: 600, color: BRAND.primary, alpha: clamp(seg(t, start + 0.7, start + 1.1)) });
}
