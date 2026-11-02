// Bộ máy dựng khung hình bài giảng — chạy trong Chromium. renderAt(t) vẽ lại toàn bộ khung từ t (giây).
// window.DATA  = dữ liệu do render.js chuẩn bị: beats (đã có start/dur/anim), svg công thức, ảnh, bản đồ.
// window.SCENE = chính tệp scene.js (để dùng các hàm vẽ hiện tượng: scene.draw.<tên>).
(function () {
  const D = window.DATA; const SC = window.SCENE || {};
  const [W, H] = D.size; const PORTRAIT = H > W; const U = Math.min(W, H) / 1080;

  // ===== Nhận diện kênh =====
  const CH = Object.assign({ name: '[TÊN KÊNH]', handle: '@tenkenh', accent: '#FF8A1F', next: '' }, D.channel || {});
  const SUBJECTS = {
    toan: ['TOÁN', '#4F46E5', 'khtn'], ly: ['VẬT LÝ', '#0284C7', 'khtn'], hoa: ['HOÁ HỌC', '#059669', 'khtn'], sinh: ['SINH HỌC', '#65A30D', 'khtn'],
    su: ['LỊCH SỬ', '#B91C1C', 'khxh'], dia: ['ĐỊA LÍ', '#0F766E', 'khxh'], van: ['NGỮ VĂN', '#7C3AED', 'khxh'], gdktpl: ['GDKT & PL', '#D97706', 'khxh'],
  };
  const SUB = SUBJECTS[D.subject] || ['BÀI GIẢNG', '#4F46E5', 'khtn'];
  const MODE = D.mode || SUB[2];
  const THEMES = {
    khtn: { bg: '#0F1726', grid: '#162236', ink: '#EEF2F8', muted: '#9AA8BD', card: 'rgba(255,255,255,0.05)', cardLine: '#2A3A55',
      capBg: 'rgba(0,0,0,0.62)', capInk: '#FFFFFF', sea: '#12233A', land: '#22344F', border: '#3B5272' },
    khxh: { bg: '#F2F4F7', grid: '#E6EAF0', ink: '#152033', muted: '#5A6880', card: '#FFFFFF', cardLine: '#DCE2EA',
      capBg: 'rgba(21,32,51,0.88)', capInk: '#FFFFFF', sea: '#CFE2F1', land: '#E6DDC6', border: '#AFA38A' },
  };
  const T = THEMES[MODE];
  // Màu đại lượng (KHTN) — dùng chung với \cF \cV \cA \cE \cB trong công thức
  const Q = { F: '#FF6B85', v: '#38D3EE', a: '#C08BFF', E: '#FFD15C', B: '#4BE08E', s: '#9FB3C8', hl: CH.accent };
  const FONT = '"Be Vietnam Pro", "DejaVu Sans", sans-serif';
  const SERIF = '"Noto Serif", "DejaVu Serif", serif';
  const HAND = '"Pangolin", "Be Vietnam Pro", sans-serif';
  const col = (c, fb) => (c ? (Q[c] || T[c] || (c === 'subject' ? SUB[1] : c)) : fb);

  // ===== Tiện ích =====
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const backOut = (x) => { x = clamp(x); const c = 1.3; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  const cv = document.getElementById('c'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // ===== Bố cục theo vùng: tác giả đặt đồ vật vào vùng, bộ máy tự xếp cho khổ ngang hay dọc =====
  const R = PORTRAIT
    ? { full: { x: 60, y: 330, w: W - 120, h: 1040 }, visual: { x: 40, y: 330, w: W - 80, h: 540 }, panel: { x: 60, y: 880, w: W - 120, h: 500 }, capY: 0.765 * H }
    : { full: { x: 70, y: 130, w: W - 140, h: H - 300 }, visual: { x: 70, y: 130, w: W * 0.5 - 70, h: H - 300 }, panel: { x: W * 0.53, y: 130, w: W * 0.47 - 70, h: H - 300 }, capY: H - 92 };
  const region = (n) => R[n || 'full'] || R.full;
  const place = (a) => { const r = region(a.in); const [u, v] = a.at || [0.5, 0.5]; return [r.x + u * r.w, r.y + v * r.h, r]; };

  // ===== Ảnh =====
  const IMG = {};
  for (const [k, v] of Object.entries(D.images || {})) { const im = new Image(); im.src = v; IMG[k] = im; }
  window.ready = Promise.all([
    ...Object.values(IMG).map((im) => im.decode().catch(() => {})),
    ...['400 40px "Be Vietnam Pro"', '500 40px "Be Vietnam Pro"', '600 40px "Be Vietnam Pro"', '700 40px "Be Vietnam Pro"', '800 40px "Be Vietnam Pro"', '40px "Pangolin"', '400 40px "Noto Serif"', 'italic 400 40px "Noto Serif"'].map((f) => document.fonts.load(f).catch(() => {})),
  ]);

  // ===== Vẽ cơ bản =====
  function text(s, x, y, o = {}) {
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
    const size = (o.size || 44) * U;
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${size}px ${o.font || FONT}`;
    if (o.maxWidth) { const w = ctx.measureText(String(s)).width; if (w > o.maxWidth) ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 700} ${size * o.maxWidth / w}px ${o.font || FONT}`; }
    ctx.fillStyle = o.color || T.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
    let str = String(s); if (o.reveal !== undefined) str = str.slice(0, Math.round(str.length * clamp(o.reveal)));
    ctx.fillText(str, x, y); const m = ctx.measureText(String(s)).width; ctx.restore();
    return m;
  }
  function wrap(s, maxW, size, weight = 600, font = FONT) {
    ctx.save(); ctx.font = `${weight} ${size * U}px ${font}`;
    const out = []; let cur = '';
    for (const w of String(s).split(/\s+/)) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
    if (cur) out.push(cur); ctx.restore(); return out;
  }
  function rr(x, y, w, h, r, fill, stroke, lw = 3) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  }
  function arrow(x1, y1, x2, y2, color, p = 1, w = 7) {
    const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p); const a = Math.atan2(ey - y1, ex - x1); const hd = w * 3.2 * U;
    if (Math.hypot(ex - x1, ey - y1) < 2) return;
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w * U; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex - Math.cos(a) * hd * 0.8, ey - Math.sin(a) * hd * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - hd * Math.cos(a - 0.42), ey - hd * Math.sin(a - 0.42)); ctx.lineTo(ex - hd * Math.cos(a + 0.42), ey - hd * Math.sin(a + 0.42)); ctx.fill();
    ctx.restore();
  }
  // Công cụ đưa cho hàm vẽ hiện tượng tự viết trong scene.js
  const KIT = { ctx, text, arrow, rr, wrap, lerp, clamp, ease, easeOut, backOut, U, T, Q, SUB, W, H };

  // ===== Bản đồ (Mercator) =====
  const merc = ([lon, lat]) => [lon, (180 / Math.PI) * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))];
  // Hai quần đảo của Việt Nam — dữ liệu Natural Earth không có, bộ máy luôn tự vẽ khi khung nhìn chứa Biển Đông
  const VN_ISLANDS = [
    { name: 'QĐ. Hoàng Sa', sub: '(Đà Nẵng)', c: [112.0, 16.5], pts: [[111.2, 16.5], [111.6, 16.85], [112.3, 16.95], [112.6, 16.55], [111.75, 16.25], [112.0, 16.6], [111.5, 16.0]] },
    { name: 'QĐ. Trường Sa', sub: '(Khánh Hoà)', c: [114.2, 9.9], pts: [[112.9, 8.65], [113.9, 10.4], [114.3, 11.1], [114.7, 10.7], [115.1, 9.9], [114.0, 9.2], [114.5, 8.8], [113.4, 9.7], [115.6, 10.4], [114.9, 11.4]] },
  ];

  function drawMap(o, r) {
    const view = o.to ? o.view.map((v, i) => lerp(v, o.to[i], ease(o.mp))) : o.view;
    const [a, b] = [merc([view[0], view[1]]), merc([view[2], view[3]])];
    const s = Math.min(r.w / (b[0] - a[0]), r.h / (b[1] - a[1]));
    const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
    const P = (ll) => { const m = merc(ll); return [r.x + r.w / 2 + (m[0] - cx) * s, r.y + r.h / 2 - (m[1] - cy) * s]; };
    ctx.save(); ctx.globalAlpha = o.alpha * clamp(o.ap * 3);
    ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, 18 * U); ctx.clip();
    ctx.fillStyle = T.sea; ctx.fillRect(r.x, r.y, r.w, r.h);
    const hi = o.highlight || {};
    const vnFill = hi['704'] ? col(hi['704'], SUB[1]) : T.land;
    for (const f of D.map) {
      ctx.beginPath();
      for (const poly of f.p) for (const ring of poly) { ring.forEach((ll, i) => { const [x, y] = P(ll); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
      const h = hi[f.id];
      ctx.fillStyle = h ? col(h, SUB[1]) : T.land; ctx.fill('evenodd');
      ctx.strokeStyle = h ? 'rgba(255,255,255,0.9)' : T.border; ctx.lineWidth = (h ? 2.5 : 1.2) * U; ctx.stroke();
    }
    if (o.vn !== false) for (const isl of VN_ISLANDS) {
      const [x0, y0] = P(isl.c); if (x0 < r.x - 50 || x0 > r.x + r.w + 50 || y0 < r.y - 50 || y0 > r.y + r.h + 50) continue;
      ctx.fillStyle = vnFill; for (const pt of isl.pts) { const [x, y] = P(pt); ctx.beginPath(); ctx.arc(x, y, 3.2 * U, 0, Math.PI * 2); ctx.fill(); }
      ctx.setLineDash([5 * U, 5 * U]); ctx.strokeStyle = vnFill; ctx.lineWidth = 1.6 * U;
      const rad = Math.max(...isl.pts.map((pt) => Math.hypot(P(pt)[0] - x0, P(pt)[1] - y0))) + 12 * U;
      ctx.beginPath(); ctx.arc(x0, y0, rad, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      text(isl.name, x0, y0 + rad + 22 * U, { size: 26, weight: 800, color: T.ink });
      text(isl.sub, x0, y0 + rad + 50 * U, { size: 22, weight: 600, color: T.muted });
    }
    (o.labels || []).forEach(([lon, lat, label, opt = {}], i) => {
      const [x, y] = P([lon, lat]); const lp = clamp(o.lp * 2 - 0.6 - i * 0.05);
      if (lp <= 0) return;
      if (opt.dot) { ctx.globalAlpha = o.alpha * lp; ctx.fillStyle = col(opt.color, T.ink); ctx.beginPath(); ctx.arc(x, y, 7 * U, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = o.alpha; }
      text(label, x + (opt.dx || 0) * U, y + (opt.dy ?? (opt.dot ? -26 : 0)) * U, { size: opt.size || 30, weight: opt.weight || 800, color: col(opt.color, T.ink), italic: opt.sea, font: opt.sea ? SERIF : FONT, alpha: o.alpha * lp });
    });
    ctx.restore();
    // khung + ghi nguồn bản đồ
    rr(r.x, r.y, r.w, r.h, 18 * U, null, T.cardLine, 2);
    text('Bản đồ: Natural Earth (phạm vi công cộng)', r.x + 14 * U, r.y + r.h - 18 * U, { size: 18, weight: 600, color: T.muted, align: 'left', alpha: o.alpha });
  }

  // ===== Áp dụng hành động của beat vào trạng thái =====
  function apply(S, a, p, q, t, start) {
    const ov = PORTRAIT ? a.portrait : a.landscape; if (ov) a = { ...a, ...ov }; // vị trí, cỡ riêng cho từng khổ
    const id = a.id || '_' + (S.n++);
    const base = { ...a, p, q, alpha: 1, born: start };
    if (a.formula !== undefined) S.items[id] = { kind: 'formula', ...base };
    else if (a.swap) { const o = S.items[a.swap]; if (o) { o.prevKey = o.prevKey && p < 1 ? o.prevKey : o.key; o.key = a.key; o.sp = p; if (p >= 1) o.prevKey = null; } }
    else if (a.text !== undefined) S.items[id] = { kind: 'text', ...base };
    else if (a.bullets) S.items[id] = { kind: 'bullets', ...base };
    else if (a.card !== undefined) S.items[id] = { kind: 'card', ...base };
    else if (a.quote !== undefined) S.items[id] = { kind: 'quote', ...base };
    else if (a.image) S.items[id] = { kind: 'image', ...base };
    else if (a.map) S.items[id] = { kind: 'map', ...base, view: a.view, ap: p, mp: p, lp: p };
    else if (a.mapTo) { // di chuyển camera bản đồ, đổi vùng tô màu, đổi nhãn
      const o = S.items[a.mapTo]; if (o) { o.view = o.to || o.view; o.to = a.view; o.mp = p; if (a.highlight) o.highlight = { ...o.highlight, ...a.highlight }; if (a.labels) { o.labels = a.labels; o.lp = p; } }
    }
    else if (a.pin) S.items[id] = { kind: 'pin', ...base };
    else if (a.timeline) S.items[id] = { kind: 'timeline', ...base, active: a.active ?? -1 };
    else if (a.tl) { const o = S.items[a.tl]; if (o) { o.prevActive = o.active; o.active = a.active; o.tp = p; } }
    else if (a.plot) S.items[id] = { kind: 'plot', ...base };
    else if (a.draw) S.items[id] = { kind: 'draw', ...base };
    else if (a.arrow) S.items[id] = { kind: 'arrow', ...base };
    else if (a.highlight) S.items[id] = { kind: 'highlight', ...base };
    else if (a.chapter !== undefined) S.items[id] = { kind: 'chapter', ...base };
    else if (a.move) { const o = S.items[a.move]; if (o) { const from = o.at || [0.5, 0.5]; o.at = [lerp(from[0], a.at[0], ease(p)), lerp(from[1], a.at[1], ease(p))]; if (a.in && p >= 1) o.in = a.in; } }
    else if (a.set) { const o = S.items[a.set]; if (o) { o.states = { ...(o.states || {}) }; for (const k of Object.keys(a)) if (!['set', 't0', 'len'].includes(k)) o.states[k] = p * (a[k] === true ? 1 : a[k]); } }
    else if (a.fade) { for (const k of [].concat(a.fade)) if (S.items[k]) { S.items[k].alpha *= 1 - p; if (p >= 1) delete S.items[k]; } }
    else if (a.clear) { if (p >= 1) S.items = {}; else for (const o of Object.values(S.items)) o.alpha *= 1 - p; }
  }
  function state(t) {
    const S = { items: {}, caption: null, n: 0, beat: -1 };
    D.beats.forEach((b, bi) => {
      if (t < b.start) return;
      const local = t - b.start; const acts = b.do || []; const n = acts.length;
      acts.forEach((a, i) => {
        const s = a.t0 ?? i / Math.max(1, n); const len = a.len ?? 1 / Math.max(1, n);
        apply(S, a, clamp((local / b.anim - s) / len), clamp(local / b.dur), t, b.start);
      });
      if (t < b.start + b.dur) { S.caption = b.caption ?? b.say; S.capQ = clamp(local / b.dur); S.beat = bi; }
    });
    return S;
  }

  // ===== Vẽ từng loại đồ vật =====
  const RECT = {};
  const DRAW = {
    formula(o, id) {
      const [x, y, rg] = place(o); const img = IMG[o.key]; if (!img) return;
      let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
      const maxW = o.align === 'left' ? rg.x + rg.w - x : rg.w; if (w > maxW) { h *= maxW / w; w = maxW; } // tự thu nhỏ cho vừa vùng
      const left = o.align === 'left' ? x : x - w / 2;
      ctx.save(); ctx.globalAlpha = o.alpha;
      if (o.prevKey && IMG[o.prevKey]) { // đổi công thức: mờ chéo + trượt nhẹ
        const pi = IMG[o.prevKey]; const pw = pi.naturalWidth; const ph = pi.naturalHeight;
        ctx.globalAlpha = o.alpha * (1 - o.sp); ctx.drawImage(pi, (o.align === 'left' ? x : x - pw / 2), y - ph / 2 - 20 * U * o.sp, pw, ph);
        ctx.globalAlpha = o.alpha * o.sp; ctx.drawImage(img, left, y - h / 2 + 20 * U * (1 - o.sp), w, h);
      } else if (o.reveal === 'fade') { ctx.globalAlpha = o.alpha * easeOut(o.p); ctx.drawImage(img, left, y - h / 2, w, h); }
      else { const vis = w * ease(o.p); if (vis > 0) { ctx.beginPath(); ctx.rect(left - 4, y - h / 2 - 10, vis + 4, h + 20); ctx.clip(); ctx.drawImage(img, left, y - h / 2, w, h); } }
      ctx.restore();
      RECT[id] = { x: left, y: y - h / 2, w, h };
    },
    text(o, id) {
      const [x, y] = place(o);
      const w = text(o.text, x, y, { size: o.size || 44, weight: o.weight || 700, color: col(o.color, T.ink), align: o.align, font: o.font === 'hand' ? HAND : o.font === 'serif' ? SERIF : FONT, reveal: easeOut(o.p * 1.4), alpha: o.alpha, maxWidth: region(o.in).w });
      const sz = (o.size || 44) * U; RECT[id] = { x: o.align === 'left' ? x : x - w / 2, y: y - sz * 0.6, w, h: sz * 1.2 };
    },
    bullets(o, id) {
      const [x, y, r] = place(o); const size = o.size || 40; const n = o.bullets.length; let yy = y;
      const maxW = r.w * (o.w || 1) - 50 * U;
      o.bullets.forEach((b, i) => {
        const from = o.from || 0; // các ý trước `from` đã hiện từ beat trước
        const p = i < from ? 1 : easeOut(clamp(o.p * (n - from) - (i - from))); const lines = wrap(b, maxW, size);
        ctx.save(); ctx.globalAlpha = o.alpha * p; ctx.fillStyle = col(o.color, SUB[1]);
        ctx.beginPath(); ctx.arc(x + 12 * U, yy, 9 * U, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        lines.forEach((l, j) => text(l, x + 40 * U + (1 - p) * 30 * U, yy + j * size * 1.3 * U, { size, weight: 600, align: 'left', alpha: o.alpha * p }));
        yy += (lines.length * size * 1.3 + size * 0.55) * U;
      });
      RECT[id] = { x, y: y - size * U, w: maxW + 40 * U, h: yy - y };
    },
    card(o, id) {
      const [x, y, r] = place(o); const w = r.w * (o.w || 1); const pad = 30 * U;
      const lines = wrap(o.body || '', w - pad * 2, o.size || 36, 500);
      const h = pad * 2 + 54 * U + lines.length * (o.size || 36) * 1.35 * U; const s = backOut(o.p);
      ctx.save(); ctx.globalAlpha = o.alpha * clamp(o.p * 2); ctx.translate(x, y); ctx.scale(s, s);
      rr(-w / 2, -h / 2, w, h, 22 * U, T.card, T.cardLine, 2);
      ctx.fillStyle = col(o.color, SUB[1]); ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, 12 * U, h, [22 * U, 0, 0, 22 * U]); ctx.fill();
      ctx.restore();
      if (o.p > 0.3) {
        const a = o.alpha * clamp(o.p * 2 - 0.6);
        text(o.card, x - w / 2 + pad + 10 * U, y - h / 2 + pad + 22 * U, { size: 40, weight: 800, color: col(o.color, SUB[1]), align: 'left', alpha: a });
        lines.forEach((l, i) => text(l, x - w / 2 + pad + 10 * U, y - h / 2 + pad + 80 * U + i * (o.size || 36) * 1.35 * U, { size: o.size || 36, weight: 500, align: 'left', alpha: a }));
      }
      RECT[id] = { x: x - w / 2, y: y - h / 2, w, h };
    },
    quote(o, id) {
      const [x, y, r] = place(o); const w = r.w * (o.w || 0.92); const size = o.size || 46;
      const lines = wrap(o.quote, w, size, 400, SERIF); const lh = size * 1.45 * U; const top = y - (lines.length * lh) / 2;
      text('“', x - w / 2 - 10 * U, top - 10 * U, { size: 150, weight: 700, font: SERIF, color: col(o.color, SUB[1]), align: 'left', alpha: o.alpha * clamp(o.p * 3) });
      lines.forEach((l, i) => text(l, x, top + lh * (i + 0.5), { size, weight: 400, italic: true, font: SERIF, alpha: o.alpha * clamp(o.p * lines.length * 1.2 - i) }));
      if (o.by) text('— ' + o.by, x + w / 2, top + lh * lines.length + 40 * U, { size: 32, weight: 700, color: T.muted, align: 'right', alpha: o.alpha * clamp(o.p * 2 - 1) });
      RECT[id] = { x: x - w / 2, y: top, w, h: lh * lines.length };
    },
    image(o, id) {
      const r = o.rect ? { x: region(o.in).x + o.rect[0] * region(o.in).w, y: region(o.in).y + o.rect[1] * region(o.in).h, w: o.rect[2] * region(o.in).w, h: o.rect[3] * region(o.in).h } : region(o.in);
      const im = IMG[o.image]; if (!im) return;
      const photo = o.frame === 'photo'; const pad = photo ? 16 * U : 0; const capH = o.credit ? 40 * U : 0;
      const box = { x: r.x + pad, y: r.y + pad, w: r.w - pad * 2, h: r.h - pad * 2 - capH };
      const appear = easeOut(o.p);
      ctx.save(); ctx.globalAlpha = o.alpha * appear;
      if (photo) { // ảnh in có viền trắng, hơi nghiêng, đổ bóng
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2); ctx.rotate(((o.tilt ?? -1.2) * Math.PI) / 180 * appear); ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
        ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 30 * U; ctx.shadowOffsetY = 10 * U;
        rr(r.x, r.y, r.w, r.h, 6 * U, '#FFFFFF'); ctx.shadowColor = 'transparent';
      }
      // Ken Burns: kb = [[tỉ lệ, tâm u, tâm v], [tỉ lệ, tâm u, tâm v]] chạy theo cả beat
      const kb = o.kb || [[1, 0.5, 0.5], [1.08, 0.5, 0.5]]; const k = ease(o.q);
      const zs = lerp(kb[0][0], kb[1][0], k), fu = lerp(kb[0][1], kb[1][1], k), fv = lerp(kb[0][2], kb[1][2], k);
      const iw = im.naturalWidth, ih = im.naturalHeight;
      const fit = o.fit === 'contain' ? Math.min(box.w / iw, box.h / ih) : Math.max(box.w / iw, box.h / ih);
      const sw = iw * fit * zs, sh = ih * fit * zs;
      const dx = box.x + box.w / 2 - fu * sw, dy = box.y + box.h / 2 - fv * sh;
      const ox = clamp(dx, box.x + box.w - sw, box.x), oy = clamp(dy, box.y + box.h - sh, box.y);
      ctx.save(); ctx.beginPath(); ctx.rect(box.x, box.y, box.w, box.h); ctx.clip();
      ctx.drawImage(im, o.fit === 'contain' ? box.x + (box.w - sw) / 2 : ox, o.fit === 'contain' ? box.y + (box.h - sh) / 2 : oy, sw, sh);
      ctx.restore();
      if (o.ai) { // nhãn bắt buộc cho ảnh tạo bằng AI hoặc ảnh minh hoạ không phải tư liệu thật
        ctx.font = `800 ${22 * U}px ${FONT}`; const lw = ctx.measureText(o.ai === true ? 'ẢNH MINH HOẠ AI' : o.ai).width + 28 * U;
        rr(box.x + 14 * U, box.y + 14 * U, lw, 40 * U, 8 * U, 'rgba(0,0,0,0.6)');
        text(o.ai === true ? 'ẢNH MINH HOẠ AI' : o.ai, box.x + 28 * U, box.y + 35 * U, { size: 22, weight: 800, color: '#fff', align: 'left' });
      }
      if (o.credit) text(o.credit, box.x + (photo ? 0 : 6 * U), box.y + box.h + capH / 2 + 2 * U, { size: 20, weight: 600, color: photo ? '#5A6880' : T.muted, align: 'left', maxWidth: box.w });
      ctx.restore();
      RECT[id] = { ...box, sw, sh, ox: o.fit === 'contain' ? box.x + (box.w - sw) / 2 : ox, oy: o.fit === 'contain' ? box.y + (box.h - sh) / 2 : oy };
    },
    pin(o) { // ghim trên ảnh: at = [u, v] theo toạ độ ảnh gốc (0..1)
      const R0 = RECT[o.pin]; if (!R0) return;
      const x = R0.ox + o.at[0] * R0.sw, y = R0.oy + o.at[1] * R0.sh; const p = backOut(o.p); const c = col(o.color, CH.accent);
      ctx.save(); ctx.globalAlpha = o.alpha * clamp(o.p * 3);
      ctx.strokeStyle = c; ctx.lineWidth = 6 * U; ctx.beginPath(); ctx.arc(x, y, (o.r || 46) * U * p, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      if (o.label) {
        const [lx, ly] = [x + (o.dx ?? 0) * U, y + (o.dy ?? -((o.r || 46) + 46)) * U];
        ctx.save(); ctx.font = `800 ${32 * U}px ${FONT}`; const w = ctx.measureText(o.label).width + 32 * U; ctx.restore();
        ctx.save(); ctx.globalAlpha = o.alpha * clamp(o.p * 2 - 0.5); rr(lx - w / 2, ly - 28 * U, w, 56 * U, 12 * U, c); ctx.restore();
        text(o.label, lx, ly + 2 * U, { size: 32, weight: 800, color: '#fff', alpha: o.alpha * clamp(o.p * 2 - 0.5) });
      }
    },
    map(o) { drawMap(o, o.rect ? { x: region(o.in).x + o.rect[0] * region(o.in).w, y: region(o.in).y + o.rect[1] * region(o.in).h, w: o.rect[2] * region(o.in).w, h: o.rect[3] * region(o.in).h } : region(o.in)); },
    timeline(o) {
      const r = region(o.in); const items = o.timeline; const n = items.length; const c = col(o.color, SUB[1]);
      const horiz = r.w > r.h * 1.2;
      const pos = (i) => horiz ? [r.x + r.w * 0.17 + (i / Math.max(1, n - 1)) * r.w * 0.66, r.y + r.h * (o.y ?? 0.5)] : [r.x + 80 * U, r.y + 40 * U + (i / Math.max(1, n - 1)) * (r.h - 80 * U)];
      const lp = ease(o.p);
      ctx.save(); ctx.globalAlpha = o.alpha; ctx.strokeStyle = T.cardLine; ctx.lineWidth = 6 * U; ctx.lineCap = 'round';
      const [x0, y0] = pos(0), [x1, y1] = pos(n - 1); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, lp), lerp(y0, y1, lp)); ctx.stroke(); ctx.restore();
      items.forEach(([year, label], i) => {
        const ip = clamp((lp * (n - 1) - i) / 0.3 + 1); if (ip <= 0) return;
        const [x, y] = pos(i); const act = i === o.active; const wasAct = i === o.prevActive;
        const ap = act ? (o.tp ?? 1) : wasAct ? 1 - (o.tp ?? 1) : 0;
        ctx.save(); ctx.globalAlpha = o.alpha * ip;
        ctx.fillStyle = ap > 0.5 ? c : T.card; ctx.strokeStyle = c; ctx.lineWidth = 5 * U;
        ctx.beginPath(); ctx.arc(x, y, (14 + 8 * ap) * U, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
        const a = o.alpha * ip * (o.active >= 0 && !act ? lerp(1, 0.45, o.tp ?? 1) : 1);
        if (horiz) {
          const LS = PORTRAIT ? 32 : 28; const up = i % 2 === 0; const lines = wrap(label, r.w * 0.3, LS, 600);
          text(year, x, y + (up ? -50 : 50) * U, { size: 38 + 6 * ap, weight: 800, color: c, alpha: a });
          lines.forEach((l, j) => text(l, x, y + (up ? -96 - (lines.length - 1 - j) * (LS + 8) : 96 + j * (LS + 8)) * U, { size: LS, weight: 600, alpha: a }));
        } else {
          text(year, x + 40 * U, y, { size: 40 + 6 * ap, weight: 800, color: c, align: 'left', alpha: a });
          const lines = wrap(label, r.w - 300 * U, 32, 600);
          lines.forEach((l, j) => text(l, x + 200 * U, y + (j - (lines.length - 1) / 2) * 40 * U, { size: 32, weight: 600, align: 'left', alpha: a }));
        }
      });
    },
    plot(o, id) { // đồ thị y = f(x): plot = biểu thức JS theo x (vd 'x*x - 2')
      const r = o.rect ? { x: region(o.in).x + o.rect[0] * region(o.in).w, y: region(o.in).y + o.rect[1] * region(o.in).h, w: o.rect[2] * region(o.in).w, h: o.rect[3] * region(o.in).h } : region(o.in);
      const [xa, xb] = o.x || [-5, 5], [ya, yb] = o.y || [-5, 5];
      const X = (x) => r.x + ((x - xa) / (xb - xa)) * r.w, Y = (y) => r.y + r.h - ((y - ya) / (yb - ya)) * r.h;
      const f = new Function('x', 'return ' + o.plot);
      ctx.save(); ctx.globalAlpha = o.alpha * clamp(o.p * 4);
      ctx.strokeStyle = T.grid; ctx.lineWidth = 1.5 * U;
      for (let gx = Math.ceil(xa); gx <= xb; gx++) { ctx.beginPath(); ctx.moveTo(X(gx), r.y); ctx.lineTo(X(gx), r.y + r.h); ctx.stroke(); }
      for (let gy = Math.ceil(ya); gy <= yb; gy++) { ctx.beginPath(); ctx.moveTo(r.x, Y(gy)); ctx.lineTo(r.x + r.w, Y(gy)); ctx.stroke(); }
      ctx.restore();
      arrow(r.x, Y(0), r.x + r.w, Y(0), T.muted, clamp(o.p * 3), 3); arrow(X(0), r.y + r.h, X(0), r.y, T.muted, clamp(o.p * 3), 3);
      text('x', r.x + r.w - 10 * U, Y(0) + 30 * U, { size: 30, font: SERIF, italic: true, color: T.muted, alpha: o.alpha });
      text('y', X(0) - 26 * U, r.y + 12 * U, { size: 30, font: SERIF, italic: true, color: T.muted, alpha: o.alpha });
      ctx.save(); ctx.globalAlpha = o.alpha; ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
      ctx.strokeStyle = col(o.color, SUB[1]); ctx.lineWidth = 6 * U; ctx.lineCap = 'round'; ctx.beginPath();
      const end = lerp(xa, xb, ease(clamp(o.p * 1.3 - 0.2))); let first = true;
      for (let x = xa; x <= end; x += (xb - xa) / 400) { const y = f(x); if (!isFinite(y)) { first = true; continue; } first ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); first = false; }
      ctx.stroke(); ctx.restore();
      RECT[id] = r;
    },
    draw(o) { const fn = SC.draw && SC.draw[o.draw]; if (fn) { ctx.save(); ctx.globalAlpha = o.alpha; fn({ ...KIT, p: o.p, q: o.q, r: region(o.in), o, s: o.states || {}, tau: NOW - o.born, alpha: o.alpha }); ctx.restore(); } },
    arrow(o) { const r = region(o.in); const [[u1, v1], [u2, v2]] = o.arrow; arrow(r.x + u1 * r.w, r.y + v1 * r.h, r.x + u2 * r.w, r.y + v2 * r.h, col(o.color, CH.accent), easeOut(o.p)); if (o.label) text(o.label, r.x + u2 * r.w, r.y + v2 * r.h - 34 * U, { size: 30, weight: 800, color: col(o.color, CH.accent), alpha: o.alpha * clamp(o.p * 2 - 1) }); },
    highlight(o) {
      const b = RECT[o.highlight]; if (!b) return; const pad = (o.pad ?? 16) * U; const p = easeOut(o.p);
      ctx.save(); ctx.globalAlpha = o.alpha; ctx.strokeStyle = col(o.color, CH.accent); ctx.lineWidth = 5 * U;
      ctx.beginPath(); ctx.roundRect(b.x - pad, b.y - pad, (b.w + pad * 2) * p, b.h + pad * 2, 14 * U); ctx.stroke(); ctx.restore();
      if (o.label) text(o.label, b.x + b.w / 2, b.y + b.h + pad + 34 * U, { size: 30, weight: 800, color: col(o.color, CH.accent), alpha: o.alpha * clamp(o.p * 2 - 1) });
    },
    chapter(o) {
      const a = o.alpha * clamp(o.p * 3);
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = SUB[1]; ctx.fillRect(W / 2 - 60 * U, H / 2 - 120 * U, 120 * U * easeOut(o.p), 10 * U); ctx.restore();
      text(o.chapter, W / 2, H / 2 - 60 * U, { size: 40, weight: 800, color: SUB[1], alpha: a });
      const lines = wrap(o.title || '', W * 0.8, 76, 800);
      lines.forEach((l, i) => text(l, W / 2, H / 2 + 30 * U + i * 92 * U, { size: 76, weight: 800, alpha: a * clamp(o.p * 2 - 0.3) }));
    },
  };

  // ===== Khung kênh: đầu trang, phụ đề, tiến độ, thẻ kết =====
  function header() {
    const lesson = D.lesson || '';
    ctx.save(); ctx.font = `800 ${30 * U}px ${FONT}`; const bw = ctx.measureText(SUB[0]).width + 40 * U; ctx.restore();
    if (PORTRAIT) {
      text(CH.name, W / 2, 190, { size: 32, weight: 800, color: T.muted });
      rr(W / 2 - bw / 2, 225, bw, 48, 10, SUB[1]); text(SUB[0], W / 2, 250, { size: 30, weight: 800, color: '#fff' });
      if (lesson) text(lesson, W / 2, 300, { size: 30, weight: 600, color: T.ink, maxWidth: W - 140 });
    } else {
      rr(70, 40, bw, 52, 10, SUB[1]); text(SUB[0], 70 + bw / 2, 67, { size: 30, weight: 800, color: '#fff' });
      if (lesson) text(lesson, 70 + bw + 22, 67, { size: 32, weight: 700, color: T.ink, align: 'left', maxWidth: W - bw - 600 });
      text(CH.name, W - 70, 67, { size: 30, weight: 800, color: T.muted, align: 'right' });
    }
  }
  function caption(s, q = 0) {
    if (!s || D.captions === false) return;
    const size = PORTRAIT ? 48 : 40; const all = wrap(s, W * (PORTRAIT ? 0.84 : 0.7), size, 700);
    // câu dài hơn 2 dòng: chia thành từng cụm 2 dòng, hiện lần lượt theo độ dài chữ
    // chia đều theo số chữ, ưu tiên ngắt sau dấu câu, để không còn mẩu cụt ở cụm cuối
    const k = Math.ceil(all.length / 2); const words = String(s).split(/\s+/); const groups = [];
    if (k <= 1) groups.push(String(s));
    else {
      const target = String(s).length / k; let cur = [];
      words.forEach((w, i) => {
        cur.push(w); const len = cur.join(' ').length; const left = words.length - i - 1;
        const punct = /[,.;:!?]$/.test(w);
        if (groups.length < k - 1 && left > 0 && (len >= target * 1.05 || (punct && len >= target * 0.6))) { groups.push(cur.join(' ')); cur = []; }
      });
      if (cur.length) groups.push(cur.join(' '));
    }
    const tot = groups.join('').length; let acc = 0, lines = wrap(groups[groups.length - 1], W * (PORTRAIT ? 0.84 : 0.7), size, 700).slice(0, 2);
    for (const g of groups) { acc += g.length / tot; if (q < acc) { lines = wrap(g, W * (PORTRAIT ? 0.84 : 0.7), size, 700).slice(0, 2); break; } }
    ctx.save(); ctx.font = `700 ${size * U}px ${FONT}`; const bw = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 56 * U; ctx.restore();
    const lh = size * 1.3 * U; const bh = lines.length * lh + 28 * U; const y0 = R.capY - bh / 2;
    rr((W - bw) / 2, y0, bw, bh, 18 * U, T.capBg);
    lines.forEach((l, i) => text(l, W / 2, y0 + 14 * U + lh * (i + 0.5), { size, weight: 700, color: T.capInk }));
  }
  function endCard(t) {
    if (!D.endDur) return; const st = D.total - D.endDur; const p = easeOut((t - st) / 0.6); if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H); ctx.restore();
    text(CH.name, W / 2, H / 2 - 120 * U, { size: 72, weight: 800, alpha: p });
    text('Học THPT dễ hiểu — mỗi ngày một bài', W / 2, H / 2 - 40 * U, { size: 36, weight: 600, color: T.muted, alpha: p });
    const s = backOut((t - st - 0.3) / 0.6);
    ctx.save(); ctx.translate(W / 2, H / 2 + 70 * U); ctx.scale(s, s); rr(-300 * U, -55 * U, 600 * U, 110 * U, 55 * U, CH.accent); ctx.restore();
    text('Theo dõi kênh', W / 2, H / 2 + 73 * U, { size: 46, weight: 800, color: '#fff', alpha: clamp(s) });
    if (CH.next) text('Bài tiếp: ' + CH.next, W / 2, H / 2 + 190 * U, { size: 36, weight: 700, color: SUB[1], alpha: clamp((t - st - 0.6) / 0.4), maxWidth: W - 160 });
    text(CH.handle, W / 2, H / 2 + 250 * U, { size: 32, weight: 600, color: T.muted, alpha: clamp((t - st - 0.7) / 0.4) });
  }

  let NOW = 0;
  window.renderAt = function (t) {
    NOW = t;
    for (const k in RECT) delete RECT[k];
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    if (MODE === 'khtn') { ctx.strokeStyle = T.grid; ctx.lineWidth = 1; for (let x = 0; x < W; x += 60 * U) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 60 * U) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
    const S = state(t);
    header();
    const order = Object.entries(S.items);
    for (const [id, o] of order) if (o.kind !== 'highlight' && o.kind !== 'chapter' && DRAW[o.kind]) DRAW[o.kind](o, id);
    for (const [id, o] of order) if (o.kind === 'highlight') DRAW.highlight(o, id);
    caption(S.caption, S.capQ);
    ctx.fillStyle = T.cardLine; ctx.fillRect(0, H - 8, W, 8); ctx.fillStyle = SUB[1]; ctx.fillRect(0, H - 8, W * clamp(t / D.total), 8);
    for (const [id, o] of order) if (o.kind === 'chapter') DRAW.chapter(o, id);
    endCard(t);
  };
})();
