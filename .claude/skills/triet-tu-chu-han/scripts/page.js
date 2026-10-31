// Chạy trong Chromium. Khung hình chỉ phụ thuộc vào t (giây): renderAt(t) vẽ lại từ đầu.
// window.SCENE = { size:[w,h], theme, beats:[{start,dur,anim,say,do:[...]}], chars:{ '休': data }, images:{src:dataURL} }

(function () {
  const THEMES = {
    paper: { bg: '#f3e9d2', grid: '#c9a98a', ink: '#241a14', ghost: 'rgba(36,26,20,0.10)', sub: '#806a4d',
      comps: ['#8f2019', '#1f4e79', '#3d6b35', '#b3833f'], capBg: 'rgba(36,26,20,0.82)', capInk: '#f8efd9' },
    board: { bg: '#24352c', grid: '#4f6b5c', ink: '#efeee4', ghost: 'rgba(239,238,228,0.10)', sub: '#b9c4b5',
      comps: ['#f2c14e', '#7fc8f8', '#f28f6b', '#b8e986'], capBg: 'rgba(0,0,0,0.55)', capInk: '#ffffff' },
  };
  const FONT_VI = '"DejaVu Serif", "Noto Serif", "Times New Roman", serif';
  const FONT_HAN = '"KaiTi", "STKaiti", "AR PL UKai CN", "Noto Serif CJK SC", "Source Han Serif SC", "WenQuanYi Zen Hei", serif';

  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, p) => a + (b - a) * p;

  const cv = document.getElementById('c');
  const ctx = cv.getContext('2d');
  const S0 = window.SCENE;
  const [W, H] = S0.size;
  cv.width = W; cv.height = H;
  const T = THEMES[S0.theme] || THEMES.paper;
  const imgs = {};
  for (const [k, v] of Object.entries(S0.images || {})) { const im = new Image(); im.src = v; imgs[k] = im; }

  // Chuẩn bị dữ liệu chữ: Path2D cho từng nét, độ dài trung tuyến, phần (component) của nét.
  const CH = {};
  for (const [ch, d] of Object.entries(S0.chars)) {
    const comp = d.strokes.map((_, i) => (d.matches[i] && d.matches[i].length ? d.matches[i][0] : 0));
    const nComp = Math.max(1, ...comp.map((c) => c + 1));
    const lens = d.medians.map((m) => m.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - m[i - 1][0], p[1] - m[i - 1][1]) : 0), 0));
    // khung bao từng phần (toạ độ đã lật: y' = 900 - y)
    const box = Array.from({ length: nComp }, () => [1e9, 1e9, -1e9, -1e9]);
    d.medians.forEach((m, i) => m.forEach(([x, y]) => {
      const b = box[comp[i]]; const yy = 900 - y;
      b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], yy); b[2] = Math.max(b[2], x); b[3] = Math.max(b[3], yy);
    }));
    const dirCh = (d.decomposition || '')[0];
    CH[ch] = { d, comp, nComp, lens, box, dir: dirCh === '⿱' || dirCh === '⿳' ? 'y' : 'x',
      paths: d.strokes.map((s) => new Path2D(s)) };
  }

  function wrap(text, maxW) {
    // Ngắt theo từ (tiếng Việt có khoảng trắng); chữ Hán ngắt theo ký tự.
    const tokens = text.match(/[㐀-鿿]|[^\s㐀-鿿]+|\s+/g) || [];
    const lines = []; let cur = '';
    for (const tk of tokens) {
      const tryS = cur + tk;
      if (ctx.measureText(tryS.trim()).width > maxW && cur.trim()) { lines.push(cur.trim()); cur = tk.trim() ? tk : ''; }
      else cur = tryS;
    }
    if (cur.trim()) lines.push(cur.trim());
    return lines;
  }

  // ---- Áp dụng các hành động của beat vào trạng thái ----
  function apply(S, a, p, beat) {
    const id = a.id;
    if (a.write || a.show) {
      const ch = a.write || a.show;
      S.chars[id || ch] = {
        ch, x: a.x ?? W / 2, y: a.y ?? H * 0.36, size: a.size ?? Math.min(W, H) * 0.6,
        drawn: a.show ? 1 : p, alpha: a.show ? p : 1, grid: a.grid !== false, color: a.color || 'component',
        ghost: a.ghost !== false, off: Array.from({ length: CH[ch].nComp }, () => [0, 0]), dim: null, labels: [],
      };
    } else if (a.split) {
      const c = S.chars[id || a.split]; if (!c) return;
      const k = CH[c.ch]; const gap = (a.gap ?? 0.2) * c.size; const n = k.nComp;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5;
        const dx = k.dir === 'x' ? t * gap * 2 : 0; const dy = k.dir === 'y' ? t * gap * 2 : 0;
        c.off[i] = [lerp(c.off[i][0], dx, p), lerp(c.off[i][1], dy, p)];
      }
    } else if (a.merge) {
      const c = S.chars[id || a.merge]; if (!c) return;
      c.off = c.off.map(([x, y]) => [lerp(x, 0, p), lerp(y, 0, p)]);
      c.labels.forEach((l) => (l.alpha *= 1 - p));
      c.dim = null;
    } else if (a.label) {
      const c = S.chars[id || a.label]; if (!c) return;
      c.labels.push({ comp: a.comp ?? 0, text: a.text || '', sub: a.sub || '', p, alpha: 1, pos: a.pos });
      if (a.focus !== false) c.dim = { comp: a.comp ?? 0, p };
    } else if (a.focus !== undefined && a.char) {
      const c = S.chars[id || a.char]; if (c) c.dim = a.focus === null ? null : { comp: a.focus, p };
    } else if (a.move) {
      const c = S.chars[id || a.move]; if (!c) return;
      c._from = c._from || { x: c.x, y: c.y, size: c.size };
      c.x = lerp(c._from.x, a.x ?? c._from.x, p); c.y = lerp(c._from.y, a.y ?? c._from.y, p);
      c.size = lerp(c._from.size, a.size ?? c._from.size, p);
      if (p >= 1) delete c._from;
    } else if (a.text !== undefined) {
      S.items[id || 'txt' + Object.keys(S.items).length] = { kind: 'text', ...a, p, alpha: 1 };
    } else if (a.sketch) {
      S.items[id || 'sk' + Object.keys(S.items).length] = { kind: 'sketch', ...a, p, alpha: 1 };
    } else if (a.image) {
      S.items[id || 'im' + Object.keys(S.items).length] = { kind: 'image', ...a, p, alpha: p };
    } else if (a.fade) {
      for (const k of [].concat(a.fade)) {
        if (S.items[k]) S.items[k].alpha *= 1 - p;
        if (S.chars[k]) S.chars[k].alpha *= 1 - p;
        if (p >= 1) { delete S.items[k]; delete S.chars[k]; }
      }
    } else if (a.clear) {
      if (p >= 1) { S.chars = {}; S.items = {}; }
      else { for (const o of [...Object.values(S.items), ...Object.values(S.chars)]) o.alpha *= 1 - p; }
    }
  }

  function state(t) {
    const S = { chars: {}, items: {}, caption: null };
    for (const b of S0.beats) {
      if (t < b.start) break;
      const local = t - b.start;
      const acts = b.do || [];
      // Các hành động trong một beat chạy nối tiếp nhau trong khoảng `anim`, trừ khi có `at`/`len` (phần của beat, 0..1).
      const n = acts.length;
      acts.forEach((a, i) => {
        const s = a.at ?? i / Math.max(1, n); const len = a.len ?? 1 / Math.max(1, n);
        const p = clamp((local / b.anim - s) / len);
        apply(S, a, a.write ? p : ease(p), b);
      });
      if (b.say && t < b.start + b.dur) S.caption = b.caption ?? b.say;
    }
    return S;
  }

  // ---- Vẽ ----
  function drawGrid(x, y, s, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = T.grid; ctx.lineWidth = Math.max(2, s / 160);
    const h = s / 2; ctx.strokeRect(x - h, y - h, s, s);
    ctx.setLineDash([s / 40, s / 40]); ctx.lineWidth = Math.max(1, s / 320);
    ctx.beginPath();
    ctx.moveTo(x - h, y); ctx.lineTo(x + h, y); ctx.moveTo(x, y - h); ctx.lineTo(x, y + h);
    ctx.moveTo(x - h, y - h); ctx.lineTo(x + h, y + h); ctx.moveTo(x + h, y - h); ctx.lineTo(x - h, y + h);
    ctx.stroke(); ctx.restore();
  }

  function drawChar(c) {
    const k = CH[c.ch]; const d = k.d; const sc = c.size / 1024;
    if (c.grid) drawGrid(c.x, c.y, c.size * 1.04, 0.55 * c.alpha * clamp(c.drawn * 4));
    // phân bổ tiến trình viết theo độ dài nét (+ một quãng nghỉ nhỏ giữa các nét)
    const pause = 120; const total = k.lens.reduce((s, l) => s + l + pause, 0);
    let acc = 0; const prog = c.drawn * total;
    d.strokes.forEach((_, i) => {
      const L = k.lens[i]; const q = clamp((prog - acc) / L); acc += L + pause;
      const ci = k.comp[i]; const [ox, oy] = c.off[ci] || [0, 0];
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.translate(c.x - c.size / 2 + ox, c.y - c.size / 2 + oy);
      ctx.scale(sc, sc); ctx.translate(0, 900); ctx.scale(1, -1);
      if (c.ghost) { ctx.fillStyle = T.ghost; ctx.fill(k.paths[i]); }
      if (q > 0) {
        let col = c.color === 'component' ? (k.nComp > 1 ? T.comps[ci % T.comps.length] : T.ink) : c.color === 'ink' ? T.ink : c.color;
        if (c.dim && c.dim.comp !== ci) ctx.globalAlpha = c.alpha * lerp(1, 0.22, c.dim.p);
        ctx.clip(k.paths[i]);
        ctx.strokeStyle = col; ctx.lineWidth = 260; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const m = d.medians[i]; let left = q * L;
        ctx.beginPath(); ctx.moveTo(m[0][0], m[0][1]);
        for (let j = 1; j < m.length && left > 0; j++) {
          const seg = Math.hypot(m[j][0] - m[j - 1][0], m[j][1] - m[j - 1][1]);
          const f = Math.min(1, left / seg);
          ctx.lineTo(lerp(m[j - 1][0], m[j][0], f), lerp(m[j - 1][1], m[j][1], f));
          left -= seg;
        }
        ctx.stroke();
        if (q >= 1) { ctx.fillStyle = col; ctx.fill(k.paths[i]); } // nét xong: tô kín để không hở mép
      }
      ctx.restore();
    });
    // nhãn cho từng phần
    for (const l of c.labels) {
      const b = k.box[l.comp]; const [ox, oy] = c.off[l.comp] || [0, 0];
      const cx = c.x - c.size / 2 + ((b[0] + b[2]) / 2) * sc + ox;
      const bottom = c.y - c.size / 2 + 1024 * sc + oy;
      const ly = l.pos === 'top' ? c.y - c.size / 2 + oy - c.size * 0.2 : bottom + c.size * 0.12;
      const col = T.comps[l.comp % T.comps.length];
      ctx.save(); ctx.globalAlpha = c.alpha * l.alpha * clamp(l.p * 2); ctx.textAlign = 'center';
      ctx.fillStyle = col; ctx.font = `bold ${Math.round(c.size * 0.16)}px ${FONT_HAN}`;
      ctx.fillText(l.text, cx, ly);
      ctx.globalAlpha = c.alpha * l.alpha * clamp(l.p * 2 - 0.5);
      ctx.fillStyle = T.ink; ctx.font = `${Math.round(c.size * 0.075)}px ${FONT_VI}`;
      ctx.fillText(l.sub, cx, ly + c.size * 0.11);
      ctx.restore();
    }
  }

  function drawText(o) {
    const size = o.size ?? Math.round(H * 0.035);
    const han = /[㐀-鿿]/.test(o.text) && o.font !== 'vi';
    ctx.save(); ctx.globalAlpha = o.alpha;
    ctx.font = `${o.bold ? 'bold ' : ''}${size}px ${han ? FONT_VI + ',' + FONT_HAN : FONT_VI}`;
    ctx.fillStyle = o.color ? (T[o.color] || o.color) : T.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
    const lines = String(o.text).split('\n');
    const all = lines.join('');
    let shown = Math.round(all.length * o.p);
    lines.forEach((ln, i) => {
      const part = ln.slice(0, Math.max(0, shown)); shown -= ln.length;
      ctx.fillText(part, o.x ?? W / 2, (o.y ?? H / 2) + i * size * 1.35);
    });
    ctx.restore();
  }

  function drawSketch(o) {
    ctx.save(); ctx.globalAlpha = o.alpha; ctx.strokeStyle = o.color ? (T[o.color] || o.color) : T.ink;
    ctx.lineWidth = o.width ?? 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const paths = Array.isArray(o.sketch[0][0]) ? o.sketch : [o.sketch];
    const lens = paths.map((pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0));
    let left = o.p * lens.reduce((a, b) => a + b, 0);
    paths.forEach((pts) => {
      if (left <= 0) return;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let j = 1; j < pts.length && left > 0; j++) {
        const seg = Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
        const f = Math.min(1, left / seg);
        ctx.lineTo(lerp(pts[j - 1][0], pts[j][0], f), lerp(pts[j - 1][1], pts[j][1], f));
        left -= seg;
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawCaption(text) {
    const size = Math.round(Math.min(W, H) * 0.048);
    ctx.save(); ctx.font = `${size}px ${FONT_VI}`;
    const lines = wrap(text, W * 0.84);
    const lh = size * 1.35; const boxH = lines.length * lh + size * 0.8;
    const y0 = H * (H > W ? 0.86 : 0.88) - boxH / 2;
    ctx.fillStyle = T.capBg;
    const bw = Math.min(W * 0.92, Math.max(...lines.map((l) => ctx.measureText(l).width)) + size * 1.4);
    ctx.beginPath(); ctx.roundRect((W - bw) / 2, y0, bw, boxH, size * 0.4); ctx.fill();
    ctx.fillStyle = T.capInk; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y0 + size * 0.4 + lh * (i + 0.5)));
    ctx.restore();
  }

  window.renderAt = function (t) {
    const S = state(t);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);
    for (const o of Object.values(S.items)) {
      if (o.kind === 'image' && imgs[o.image]) {
        ctx.save(); ctx.globalAlpha = o.alpha; ctx.drawImage(imgs[o.image], o.x - o.w / 2, o.y - o.h / 2, o.w, o.h); ctx.restore();
      }
    }
    for (const c of Object.values(S.chars)) drawChar(c);
    for (const o of Object.values(S.items)) {
      if (o.kind === 'text') drawText(o);
      else if (o.kind === 'sketch') drawSketch(o);
    }
    if (S.caption && S0.captions !== false) drawCaption(S.caption);
    return true;
  };
  window.READY = true;
})();
