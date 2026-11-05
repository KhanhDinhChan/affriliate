// Mẫu CHỮA BÀI (Vật lí) — giao diện Sổ tay, khổ dọc 9:16.
// Dựng: node ../../../bai-giang-thpt/engine/render.js scene.js
// Khuôn: ĐỀ BÀI + HÌNH (mô phỏng đúng công thức) → TÓM TẮT → CÔNG THỨC → THAY SỐ → ĐÁP SỐ (khoanh) → BẪY THƯỜNG GẶP.
// Đề do trung tâm tự soạn: h = 45 m, g = 10 m/s² → t = √(2h/g) = 3 s, v = g·t = 30 m/s.

module.exports = {
  size: [1080, 1920],
  subject: 'ly',
  look: 'so-tay',
  lesson: 'Vật lí 10 · Rơi tự do',
  channel: { next: 'Ném ngang: vì sao hai viên bi chạm đất cùng lúc?' },
  beats: [
    {
      say: 'Thả rơi một vật từ độ cao 45 mét. Mất bao lâu thì chạm đất?',
      do: [{ chapter: 'GIẢI NHANH', title: 'Thả rơi từ 45 m: mất bao lâu?', id: 'chap' }],
    },
    {
      say: 'Đề bài: thả rơi một vật từ độ cao 45 mét, lấy g bằng 10. Tính thời gian rơi và tốc độ khi chạm đất.',
      do: [
        { fade: 'chap', len: 0.2 },
        { draw: 'roi', id: 'sim', in: 'visual', t0: 0.1, len: 0.4 },
        { card: 'Đề bài', body: 'Thả rơi một vật từ độ cao 45 m, lấy g = 10 m/s². Tính thời gian rơi và tốc độ của vật khi chạm đất.', id: 'de', in: 'panel', at: [0.5, 0.4], size: 40, t0: 0.3, len: 0.6 },
      ],
    },
    {
      say: 'Tóm tắt: h bằng 45 mét, g bằng 10 mét trên giây bình phương, vận tốc đầu bằng 0.',
      do: [
        { fade: 'de', len: 0.2 },
        { formula: String.raw`h = 45\ \mathrm{m},\quad g = 10\ \mathrm{m/s^2},\quad v_0 = 0`, id: 'f1', in: 'panel', at: [0, 0.08], align: 'left', size: 50, t0: 0.2, len: 0.7 },
      ],
    },
    {
      say: 'Rơi tự do: h bằng một phần hai g t bình phương, suy ra t bằng căn của 2h chia g.',
      do: [{ formula: String.raw`h = \tfrac{1}{2}\,g\,t^2 \;\Rightarrow\; t = \sqrt{\dfrac{2h}{g}}`, id: 'f2', in: 'panel', at: [0, 0.34], align: 'left', size: 56 }],
    },
    {
      say: 'Thay số: t bằng căn của 2 nhân 45 chia 10, bằng căn 9, bằng 3 giây.',
      do: [
        { formula: String.raw`t = \sqrt{\dfrac{2\cdot 45}{10}} = \sqrt{9} = \hl{3\ \mathrm{s}}`, id: 'f3', in: 'panel', at: [0, 0.62], align: 'left', size: 56, len: 0.6 },
        { set: 'sim', drop: true, t0: 0, len: 1 },
      ],
    },
    {
      say: 'Tốc độ khi chạm đất: v bằng g nhân t, bằng 30 mét trên giây.',
      do: [
        { formula: String.raw`\cV{v} = g\,t = 10\cdot 3 = \hl{30\ \mathrm{m/s}}`, id: 'f4', in: 'panel', at: [0, 0.86], align: 'left', size: 56, len: 0.6 },
        { highlight: 'f4', t0: 0.6, len: 0.4 },
      ],
    },
    {
      say: 'Bẫy thường gặp: quên lấy căn sẽ ra 9 giây. Hãy kiểm tra đơn vị: căn của mét chia mét trên giây bình phương là giây.',
      do: [
        { fade: ['f1', 'f2', 'f3', 'f4'], len: 0.25 },
        { card: 'Bẫy thường gặp', body: 'Quên lấy căn → t = 9 s (sai). Luôn kiểm tra đơn vị: √(m : m/s²) = √(s²) = s.', in: 'panel', at: [0.5, 0.42], size: 40, color: 'hl', t0: 0.25, len: 0.6 },
      ],
    },
  ],

  // ===== Hình: vật rơi tự do theo đúng y = ½gt² (s.drop: 0 → 1 ứng với 0 → 3 s) =====
  draw: {
    roi({ ctx, r, p, s, text, arrow, U, T, Q, clamp, easeOut }) {
      const HF = '"Patrick Hand", sans-serif';
      const g0 = r.y + r.h * 0.9, top = r.y + r.h * 0.12, tx = r.x + r.w * 0.16, tw = 120 * U;
      const bx = tx + tw + 150 * U, R0 = 22 * U, y0 = top - R0, y1 = g0 - R0;
      const k = easeOut(clamp(p * 1.5)); ctx.save(); ctx.globalAlpha *= k;
      // toà nhà và mặt đất (nét mực)
      ctx.strokeStyle = T.ink; ctx.lineWidth = 4 * U; ctx.lineJoin = 'round';
      ctx.strokeRect(tx, top, tw, g0 - top);
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { ctx.strokeRect(tx + 22 * U + j * 46 * U, top + 24 * U + i * 60 * U, 28 * U, 32 * U); }
      ctx.beginPath(); ctx.moveTo(r.x + 30 * U, g0); ctx.lineTo(r.x + r.w - 30 * U, g0); ctx.stroke();
      for (let x = r.x + 40 * U; x < r.x + r.w - 40 * U; x += 34 * U) { ctx.beginPath(); ctx.moveTo(x, g0 + 4 * U); ctx.lineTo(x - 16 * U, g0 + 22 * U); ctx.stroke(); }
      // kích thước h
      const dx = bx + 110 * U; ctx.setLineDash([10 * U, 8 * U]); ctx.strokeStyle = Q.s; ctx.lineWidth = 3 * U;
      ctx.beginPath(); ctx.moveTo(dx, top); ctx.lineTo(dx, g0); ctx.stroke(); ctx.setLineDash([]);
      arrow(dx, (top + g0) / 2, dx, top + 4 * U, Q.s, 1, 3); arrow(dx, (top + g0) / 2, dx, g0 - 4 * U, Q.s, 1, 3);
      text('h = 45 m', dx + 18 * U, (top + g0) / 2, { size: 40, weight: 400, font: HF, color: T.ink, align: 'left' });
      ctx.restore();
      // vật rơi: τ là thời gian vật lý (giây)
      const tau = 3 * clamp(s.drop || 0); const yAt = (tt) => y0 + (y1 - y0) * (tt / 3) ** 2;
      ctx.save(); ctx.globalAlpha *= k;
      for (let tt = 0.5; tt <= tau + 1e-6 && tt < 3; tt += 0.5) { ctx.fillStyle = 'rgba(34,48,90,0.22)'; ctx.beginPath(); ctx.arc(bx, yAt(tt), R0, 0, Math.PI * 2); ctx.fill();
        text(tt.toFixed(1).replace('.', ',') + ' s', bx - R0 - 12 * U, yAt(tt), { size: 24, weight: 400, font: HF, color: T.muted, align: 'right' }); }
      const y = yAt(tau);
      if (tau > 0.02 && tau < 2.98) {
        arrow(bx, y + R0, bx, y + R0 + 12 * U + 150 * U * (tau / 3), Q.v, 1, 7);
        text('v', bx + 18 * U, y + R0 + 40 * U + 75 * U * (tau / 3), { size: 40, weight: 800, color: Q.v, align: 'left' });
        arrow(bx - 46 * U, y, bx - 46 * U, y + 70 * U, Q.a, 1, 6);
        text('a = g', bx - 58 * U, y + 50 * U, { size: 30, weight: 800, color: Q.a, align: 'right' });
      }
      ctx.fillStyle = T.ink; ctx.beginPath(); ctx.arc(bx, y, R0, 0, Math.PI * 2); ctx.fill();
      // đồng hồ
      if (s.drop > 0) text('t = ' + tau.toFixed(1).replace('.', ',') + ' s', r.x + r.w - 40 * U, r.y + 40 * U, { size: 48, weight: 400, font: HF, color: T.ink, align: 'right' });
      ctx.restore();
    },
  },
};
