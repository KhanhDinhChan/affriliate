// Ví dụ KHTN · Hoá học 12 — Natri tác dụng với nước. Khổ dọc 9:16 cho TikTok.
// Dựng: node ../../engine/render.js scene.js                  (TikTok 1080×1920)
//       node ../../engine/render.js scene.js --size 1920x1080  (bản YouTube ngang, cùng kịch bản)
// Các khoá `portrait: {...}` chỉnh vị trí/cỡ riêng cho khổ dọc, vì vùng chữ ở khổ dọc thấp hơn.
// Mẫu cho mọi bài KHTN: HIỆN TƯỢNG (mô phỏng) → QUAN SÁT → PHƯƠNG TRÌNH (tô màu chất cần chú ý) → VÍ DỤ TÍNH → GHI NHỚ.

module.exports = {
  size: [1080, 1920],
  subject: 'hoa',
  look: 'so-tay', // giao diện Sổ tay chung cho mọi môn; bỏ dòng này để về giao diện cũ (nền bảng tối)
  lesson: 'Hoá 12 · Kim loại nhóm IA tác dụng với nước',
  channel: { next: 'Vì sao K, Rb, Cs phản ứng mạnh hơn Na?' },
  // voiceDir: 'vo',
  beats: [
    {
      say: 'Thả một mẩu natri nhỏ vào cốc nước có vài giọt phenolphtalein. Điều gì sẽ xảy ra?',
      do: [{ chapter: 'THÍ NGHIỆM', title: 'Natri + nước có phenolphtalein', id: 'chap' }],
    },
    {
      say: 'Mẩu natri nóng chảy thành giọt tròn, chạy nhanh trên mặt nước và sủi bọt khí.',
      do: [{ fade: 'chap', len: 0.25 }, { draw: 'natri', id: 'sim', in: 'visual', t0: 0.1, len: 0.3 },
        { bullets: ['Natri chạy trên mặt nước, tan dần', 'Sủi bọt khí không màu'], id: 'obs', in: 'panel', at: [0, 0.08], size: 40, t0: 0.4, len: 0.6 }],
    },
    {
      say: 'Đồng thời, dung dịch chuyển dần sang màu hồng.',
      do: [{ set: 'sim', hong: true }, { bullets: ['Natri chạy trên mặt nước, tan dần', 'Sủi bọt khí không màu', 'Dung dịch chuyển màu hồng'], id: 'obs', in: 'panel', at: [0, 0.08], size: 40, from: 2, t0: 0.2, len: 0.5 }],
    },
    {
      say: 'Phương trình phản ứng: natri tác dụng với nước tạo natri hiđroxit và khí hiđro.',
      do: [{ formula: '\\ce{2Na + 2H2O -> 2NaOH + H2 ^}', id: 'pt', in: 'panel', at: [0.5, 0.62], size: 58 }],
    },
    {
      say: 'Bọt khí chính là hiđro. Còn màu hồng cho biết dung dịch có tính bazơ, do tạo ra NaOH.',
      do: [
        { swap: 'pt', formula: '2\\,\\mathrm{Na} + 2\\,\\mathrm{H_2O} \\longrightarrow 2\\,\\hl{\\mathrm{NaOH}} + \\cV{\\mathrm{H_2}}\\uparrow', size: 58, len: 0.3 },
        { set: 'sim', label: true, t0: 0.3, len: 0.5 },
      ],
    },
    {
      say: 'Ví dụ: cho 2,3 gam natri vào nước dư. Tính thể tích khí hiđro ở điều kiện chuẩn.',
      do: [
        { fade: ['obs'], len: 0.2 },
        { move: 'pt', at: [0.5, 0.2], portrait: { at: [0.5, 0.13] }, t0: 0.15, len: 0.35 },
        { text: 'Ví dụ: 2,3 g Na + nước dư → V(H₂) ở đkc = ?', id: 'vd', in: 'panel', at: [0, 0.04], align: 'left', size: 40, color: 'hl', portrait: { at: [0, 0.0] }, t0: 0.4, len: 0.6 },
      ],
    },
    {
      say: 'Số mol natri bằng 2,3 chia 23, bằng 0,1 mol.',
      do: [{ formula: 'n_{\\mathrm{Na}} = \\dfrac{2{,}3}{23} = 0{,}1\\ \\mathrm{mol}', id: 'b1', in: 'panel', at: [0, 0.42], align: 'left', size: 62, portrait: { at: [0, 0.38], size: 54 } }],
    },
    {
      say: 'Theo phương trình, số mol hiđro bằng một nửa số mol natri, tức 0,05 mol.',
      do: [{ formula: 'n_{\\cV{\\mathrm{H_2}}} = \\tfrac{1}{2}\\, n_{\\mathrm{Na}} = 0{,}05\\ \\mathrm{mol}', id: 'b2', in: 'panel', at: [0, 0.62], align: 'left', size: 62, portrait: { at: [0, 0.63], size: 54 } }],
    },
    {
      say: 'Ở điều kiện chuẩn, một mol khí chiếm 24,79 lít. Vậy thể tích hiđro xấp xỉ 1,24 lít.',
      do: [
        { formula: 'V = 0{,}05 \\times 24{,}79 \\approx \\hl{1{,}24\\ \\mathrm{L}}', id: 'b3', in: 'panel', at: [0, 0.82], align: 'left', size: 62, portrait: { at: [0, 0.87], size: 54 }, len: 0.6 },
        { highlight: 'b3', t0: 0.6, len: 0.4 },
      ],
    },
    {
      say: 'Ghi nhớ: kim loại nhóm IA tác dụng với nước tạo dung dịch kiềm và khí hiđro.',
      do: [
        { fade: ['vd', 'b1', 'b2', 'b3', 'pt'], len: 0.25 },
        { card: 'Ghi nhớ', body: 'Kim loại nhóm IA + nước → dung dịch kiềm + H₂↑. Ở đkc (25 °C, 1 bar), 1 mol khí chiếm 24,79 L.', in: 'panel', at: [0.5, 0.45], size: 40, t0: 0.25, len: 0.6 },
      ],
    },
  ],

  // ===== Mô phỏng hiện tượng: hàm vẽ, chỉ phụ thuộc thời gian (tau) và trạng thái (s.hong, s.label) =====
  draw: {
    natri({ ctx, r, tau, s, text, arrow, U, T, Q, lerp, clamp, easeOut }) {
      const cx = r.x + r.w / 2, base = r.y + r.h * 0.95, bw = r.w * 0.62, bh = r.h * 0.72;
      const top = base - bh, water = base - bh * 0.62;
      const pink = clamp(s.hong || 0);
      // nước
      const grad = ctx.createLinearGradient(0, water, 0, base);
      grad.addColorStop(0, `rgba(${lerp(110, 255, pink)},${lerp(170, 110, pink)},${lerp(255, 190, pink)},${lerp(0.22, 0.55, pink)})`);
      grad.addColorStop(1, `rgba(${lerp(80, 236, pink)},${lerp(140, 72, pink)},${lerp(230, 153, pink)},${lerp(0.32, 0.7, pink)})`);
      ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(cx - bw / 2, water); ctx.lineTo(cx + bw / 2, water); ctx.lineTo(cx + bw / 2, base - 30 * U);
      ctx.quadraticCurveTo(cx + bw / 2, base, cx + bw / 2 - 30 * U, base); ctx.lineTo(cx - bw / 2 + 30 * U, base); ctx.quadraticCurveTo(cx - bw / 2, base, cx - bw / 2, base - 30 * U); ctx.closePath(); ctx.fill();
      // cốc thuỷ tinh
      ctx.strokeStyle = T.glass; ctx.lineWidth = 6 * U; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(cx - bw / 2 - 18 * U, top); ctx.lineTo(cx - bw / 2, top + 14 * U); ctx.lineTo(cx - bw / 2, base - 30 * U); ctx.quadraticCurveTo(cx - bw / 2, base, cx - bw / 2 + 30 * U, base);
      ctx.lineTo(cx + bw / 2 - 30 * U, base); ctx.quadraticCurveTo(cx + bw / 2, base, cx + bw / 2, base - 30 * U); ctx.lineTo(cx + bw / 2, top + 14 * U); ctx.lineTo(cx + bw / 2 + 18 * U, top); ctx.stroke();
      for (let k = 1; k <= 4; k++) { const y = base - (bh * k) / 5; ctx.beginPath(); ctx.moveTo(cx + bw / 2 - 40 * U, y); ctx.lineTo(cx + bw / 2 - 10 * U, y); ctx.stroke(); }
      text('nước + phenolphtalein', cx, base + 0 * U - bh - 30 * U, { size: 28, weight: 600, color: T.muted });
      // mẩu natri: rơi xuống rồi chạy trên mặt nước, nhỏ dần
      const drop = clamp(tau / 0.7);
      const pos = (tt) => [cx + bw * 0.36 * Math.sin(1.9 * tt) * Math.cos(0.7 * tt + 0.4), water - 4 * U];
      const rad = 20 * U * (1 - 0.55 * clamp((tau - 0.7) / 25));
      let [nx, ny] = pos(Math.max(0, tau - 0.7));
      if (drop < 1) { ny = lerp(top - 80 * U, water - 4 * U, drop * drop); nx = cx; }
      if (drop >= 1) { // bọt khí hiđro: mỗi bọt sinh ra ở vị trí mẩu Na tại thời điểm đó rồi nổi lên, vỡ dần
        const STEP = 0.05, LIFE = 1.4, now = tau - 0.7;
        const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
        for (let e = Math.floor(now / STEP); e >= 0 && now - e * STEP < LIFE; e--) {
          const age = (now - e * STEP) / LIFE; const [bx] = pos(e * STEP);
          const ox = (hash(e) - 0.5) * 46 * U, rise = age * (50 + 40 * hash(e + 7)) * U, rr0 = (3 + 6 * hash(e + 3)) * U;
          ctx.strokeStyle = `rgba(${T.bubble},${0.9 * (1 - age)})`; ctx.lineWidth = 2.2 * U;
          ctx.beginPath(); ctx.arc(bx + ox, water - 6 * U - rise, rr0 * (0.6 + 0.6 * age), 0, Math.PI * 2); ctx.stroke();
        }
      }
      const g2 = ctx.createRadialGradient(nx - rad / 3, ny - rad / 3, rad / 6, nx, ny, rad);
      g2.addColorStop(0, '#FFFFFF'); g2.addColorStop(1, '#9AA4B2');
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(nx, ny, rad, 0, Math.PI * 2); ctx.fill();
      text('Na', nx, ny - rad - 22 * U, { size: 30, weight: 800, color: T.ink, alpha: clamp(1 - (s.label || 0)) });
      // nhãn giải thích
      const L = clamp(s.label || 0);
      if (L > 0) {
        const [bx] = pos(Math.max(0, tau - 0.9));
        arrow(r.x + r.w * 0.12, top - 10 * U, bx - 6 * U, water - 40 * U, Q.v, easeOut(L));
        text('khí H₂', r.x + r.w * 0.12, top - 44 * U, { size: 36, weight: 800, color: Q.v, alpha: L });
        arrow(r.x + r.w * 0.9, base - bh * 0.95, cx + bw * 0.3, base - bh * 0.3, Q.hl, easeOut(L));
        text('màu hồng: có OH⁻', r.x + r.w * 0.86, base - bh * 0.95 - 34 * U, { size: 34, weight: 800, color: Q.hl, alpha: L });
      }
    },
  },
};
