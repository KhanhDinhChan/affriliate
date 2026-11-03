// fx.js — tiện ích hiệu ứng dùng chung cho 4 phong cách (nạp sau lib.js).
// Mọi hiệu ứng chỉ phụ thuộc t và hạt giống (seed), nên chụp khung nào cũng ra cùng một hình.

const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// Lò xo bật ra: 0 → vượt quá 1 → dao động tắt dần về 1
const spring = (t, t0, k = 1) => { const u = t - t0; if (u <= 0) return 0; return 1 - Math.exp(-6 * u / k) * Math.cos(13 * u / k); };

// Rung nhẹ cả khung khi va chạm
function shakeAt(t, t0, amp = 14, dur = 0.3) {
  const u = t - t0; if (u < 0 || u > dur) return [0, 0];
  const k = (1 - u / dur) * amp; const f = Math.floor(t * 60);
  return [(hash(f) - 0.5) * 2 * k, (hash(f + 7) - 0.5) * 2 * k];
}

// Chia đoạn thẳng thành nhiều điểm để nét rung trông tự nhiên
function linePts(x1, y1, x2, y2, n = 8) { const a = []; for (let i = 0; i <= n; i++) a.push([lerp(x1, x2, i / n), lerp(y1, y2, i / n)]); return a; }
function ellipsePts(cx, cy, rx, ry, n = 28, a0 = -Math.PI / 2, sweep = Math.PI * 2) {
  const a = []; for (let i = 0; i <= n; i++) { const th = a0 + sweep * i / n; a.push([cx + rx * Math.cos(th), cy + ry * Math.sin(th)]); } return a;
}
function quadPts(x0, y0, cx, cy, x1, y1, n = 14) {
  const a = []; for (let i = 0; i <= n; i++) { const u = i / n; a.push([(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1]); } return a;
}
function rectPts(x, y, w, h, n = 4) {
  return [...linePts(x, y, x + w, y, n), ...linePts(x + w, y, x + w, y + h, n).slice(1), ...linePts(x + w, y + h, x, y + h, n).slice(1), ...linePts(x, y + h, x, y, n).slice(1)];
}
const pathLen = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };

// Vẽ nhiều nét lần lượt theo tiến độ p (0..1) tính trên tổng chiều dài; nét rung đổi 12 lần/giây.
// Trả về đầu bút hiện tại [x, y] (hoặc null khi đã vẽ xong) để đặt ngòi bút.
function sketchStrokes(ctx, strokes, p, o = {}) {
  if (p <= 0) return null;
  const t = o.t ?? 0; const amp = o.amp ?? 1.5; const boil = Math.floor(t * 12); const seed = o.seed ?? 1;
  const lens = strokes.map(pathLen); const total = lens.reduce((a, b) => a + b, 0); let left = total * clamp(p);
  ctx.save(); ctx.strokeStyle = o.color || '#22305A'; ctx.lineWidth = o.width || 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowBlur ?? 14; }
  let tip = null;
  strokes.forEach((pts, si) => {
    if (left <= 0) return;
    const J = pts.map((q, i) => [q[0] + (hash(seed * 97 + si * 31 + i * 7 + boil * 13) - 0.5) * 2 * amp, q[1] + (hash(seed * 53 + si * 17 + i * 11 + boil * 29) - 0.5) * 2 * amp]);
    ctx.beginPath(); ctx.moveTo(J[0][0], J[0][1]);
    for (let i = 1; i < J.length; i++) {
      const d = Math.hypot(J[i][0] - J[i - 1][0], J[i][1] - J[i - 1][1]);
      if (left >= d) { ctx.lineTo(J[i][0], J[i][1]); left -= d; }
      else { const u = left / d; const x = lerp(J[i - 1][0], J[i][0], u), y = lerp(J[i - 1][1], J[i][1], u); ctx.lineTo(x, y); tip = [x, y]; left = 0; break; }
    }
    if (o.fill && left > 0) { ctx.fillStyle = o.fill; ctx.fill(); }
    ctx.stroke();
  });
  ctx.restore();
  return p < 1 ? tip : null;
}

// Chữ hiện dần từ trái sang phải như đang viết; trả về vị trí ngòi bút khi đang viết.
function writeText(ctx, s, x, y, p, o = {}) {
  if (p <= 0) return null;
  ctx.save();
  ctx.font = `${o.weight || 400} ${o.size || 60}px ${o.font || '"Patrick Hand", sans-serif'}`;
  let w = ctx.measureText(s).width;
  if (o.maxWidth && w > o.maxWidth) { const sz = Math.floor((o.size || 60) * o.maxWidth / w); ctx.font = `${o.weight || 400} ${sz}px ${o.font || '"Patrick Hand", sans-serif'}`; w = ctx.measureText(s).width; }
  const align = o.align || 'center'; const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const size = parseFloat(ctx.font.split('px')[0].split(' ').pop());
  ctx.beginPath(); ctx.rect(x0 - 10, y - size * 1.2, (w + 20) * clamp(p), size * 2.4); ctx.clip();
  ctx.fillStyle = o.color || '#22305A'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillText(s, x0, y);
  ctx.restore();
  return p < 1 ? [x0 + w * p, y + size * 0.25] : null;
}

// Hạt sáng / bụi bay chậm (nền)
function motes(ctx, t, o = {}) {
  const [W, H] = window.SIZE; const n = o.n ?? 40;
  ctx.save();
  for (let i = 0; i < n; i++) {
    const sp = 12 + hash(i * 3) * 30; const x = (hash(i) * W + Math.sin(t * 0.4 + i) * 30) % W;
    const y = ((hash(i * 5) * H - t * sp) % H + H) % H; const r = (o.r ?? 2.2) * (0.5 + hash(i * 9));
    ctx.globalAlpha = (o.alpha ?? 0.5) * (0.4 + 0.6 * Math.abs(Math.sin(t * (0.6 + hash(i * 2)) + i)));
    ctx.fillStyle = o.color || '#E5CF95'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// Ngôi sao 4 cánh lấp lánh
function sparkle(ctx, x, y, r, color = '#fff', alpha = 1) {
  if (r <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2; const rr = i % 2 ? r * 0.28 : r; ctx.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
