// Ví dụ KHXH · Lịch sử 12 — Chiến dịch Điện Biên Phủ (1954). Khổ dọc 9:16, giao diện Sổ tay.
// Dựng: node ../../engine/render.js scene.js
// Mẫu bài Lịch sử: BẢN ĐỒ định vị → SƠ ĐỒ (đơn giản hoá) → ẢNH TƯ LIỆU → DÒNG THỜI GIAN diễn biến → KẾT QUẢ → Ý NGHĨA → TRÍCH DẪN.
// Số liệu theo SGK Lịch sử 12: 13/3–7/5/1954 (56 ngày đêm); 49 cứ điểm, 3 phân khu; loại khỏi vòng chiến đấu 16 200 địch,
// bắn rơi và phá huỷ 62 máy bay; Hiệp định Giơ-ne-vơ kí ngày 21/7/1954.
// Ảnh tư liệu: đặt vào assets/ đúng tên file và ghi nguồn, giấy phép vào assets/NGUON.md. Chưa có ảnh thì bộ máy hiện khung chờ.

module.exports = {
  size: [1080, 1920],
  subject: 'su',
  look: 'so-tay',
  lesson: 'Lịch sử 12 · Chiến dịch Điện Biên Phủ (1954)',
  channel: { next: 'Hiệp định Giơ-ne-vơ năm 1954' },
  beats: [
    {
      say: 'Năm 1954, tại một thung lũng ở Tây Bắc, quân dân ta giành chiến thắng làm chấn động thế giới.',
      do: [{ chapter: 'LỊCH SỬ 12', title: '56 ngày đêm Điện Biên Phủ', id: 'chap' }],
    },
    {
      say: 'Điện Biên Phủ là một thung lũng lớn ở vùng rừng núi Tây Bắc, gần biên giới Việt – Lào.',
      do: [
        { fade: 'chap', len: 0.2 },
        { map: true, id: 'm', in: 'visual', view: [96, 5, 122, 25], to: [100.2, 19.6, 106.6, 23.6], highlight: { 704: '#EDB7AE' }, t0: 0.1, len: 0.9 },
        { text: 'Điện Biên Phủ ở đâu?', id: 'h1', in: 'panel', at: [0.5, 0.14], size: 60, weight: 800, t0: 0.3, len: 0.4 },
      ],
    },
    {
      say: 'Cuối năm 1953, thực dân Pháp biến nơi đây thành tập đoàn cứ điểm mạnh nhất Đông Dương.',
      do: [
        { mapTo: 'm', view: [100.2, 19.6, 106.6, 23.6], labels: [
          [103.02, 21.39, 'Điện Biên Phủ', { dot: true, size: 36, color: 'subject', dy: -30 }], [105.85, 21.03, 'Hà Nội', { dot: true, size: 30 }],
          [102.4, 20.2, 'LÀO', { size: 30, color: 'muted' }], [104.6, 23.2, 'TRUNG QUỐC', { size: 28, color: 'muted' }]] },
        { card: 'Tập đoàn cứ điểm', body: 'Pháp tập trung binh lực, xây dựng Điện Biên Phủ thành “pháo đài bất khả xâm phạm” giữa núi rừng Tây Bắc.', id: 'c0', in: 'panel', at: [0.5, 0.52], size: 38, t0: 0.35, len: 0.6 },
      ],
    },
    {
      say: 'Tập đoàn cứ điểm gồm 49 cứ điểm, chia thành ba phân khu: Bắc, Trung tâm và Nam, có cả sân bay tiếp tế.',
      do: [
        { fade: ['m', 'h1', 'c0'], len: 0.25 },
        { draw: 'socuDiem', id: 'sd', in: 'visual', t0: 0.15, len: 0.55 },
        { card: '49 cứ điểm · 3 phân khu', body: 'Phân khu Bắc (Him Lam, Độc Lập, Bản Kéo) · Phân khu Trung tâm (Mường Thanh, sân bay) · Phân khu Nam (Hồng Cúm).', id: 'c1', in: 'panel', at: [0.5, 0.42], size: 36, t0: 0.4, len: 0.6 },
      ],
    },
    {
      say: 'Ngày 13 tháng 3 năm 1954, quân ta nổ súng mở màn chiến dịch.',
      do: [
        { fade: 'c1', len: 0.2 },
        { image: 'assets/dien-bien-phu-1954.jpg', id: 'img', in: 'panel', rect: [0.08, 0.02, 0.84, 0.82], credit: 'Ảnh tư liệu · ghi nguồn và giấy phép khi đặt ảnh', t0: 0.2, len: 0.5 },
      ],
    },
    {
      say: 'Chiến dịch diễn ra qua ba đợt tiến công.',
      do: [
        { fade: 'img', len: 0.25 },
        { timeline: [['13/3', 'Đợt 1: Him Lam, phân khu Bắc'], ['30/3', 'Đợt 2: các cao điểm phía đông'], ['1/5', 'Đợt 3: tổng công kích']], id: 'tl', in: 'panel', y: 0.45, t0: 0.25, len: 0.75 },
      ],
    },
    {
      say: 'Đợt một, quân ta tiêu diệt cụm cứ điểm Him Lam và toàn bộ phân khu Bắc.',
      do: [{ tl: 'tl', active: 0, len: 0.3 }, { set: 'sd', d1: true, t0: 0.2, len: 0.7 }],
    },
    {
      say: 'Đợt hai, ta đánh chiếm các cao điểm phía đông phân khu Trung tâm, giành giật quyết liệt ở đồi A1.',
      do: [{ tl: 'tl', active: 1, len: 0.3 }, { set: 'sd', d2: true, t0: 0.2, len: 0.7 }],
    },
    {
      say: 'Đợt ba, tổng công kích. Chiều 7 tháng 5, tướng Đờ Cát-xtơ-ri cùng toàn bộ Ban tham mưu bị bắt sống.',
      do: [{ tl: 'tl', active: 2, len: 0.3 }, { set: 'sd', d3: true, t0: 0.2, len: 0.7 }],
    },
    {
      say: 'Ta loại khỏi vòng chiến đấu 16 200 quân địch, bắn rơi và phá huỷ 62 máy bay.',
      do: [
        { fade: 'tl', len: 0.25 },
        { card: 'Kết quả', body: 'Loại khỏi vòng chiến đấu 16 200 quân địch, bắn rơi và phá huỷ 62 máy bay.', id: 'kq', in: 'panel', at: [0.5, 0.4], size: 42, t0: 0.25, len: 0.6 },
      ],
    },
    {
      say: 'Chiến thắng đập tan kế hoạch Na-va, buộc Pháp kí Hiệp định Giơ-ne-vơ, chấm dứt chiến tranh ở Đông Dương.',
      do: [
        { fade: 'kq', len: 0.2 },
        { card: 'Ý nghĩa', body: 'Đập tan kế hoạch Na-va, buộc Pháp kí Hiệp định Giơ-ne-vơ (21/7/1954), chấm dứt chiến tranh, lập lại hoà bình ở Đông Dương.', id: 'yn', in: 'panel', at: [0.5, 0.42], size: 40, t0: 0.2, len: 0.6 },
      ],
    },
    {
      say: 'Như nhà thơ Tố Hữu viết: Chín năm làm một Điện Biên, nên vành hoa đỏ, nên thiên sử vàng.',
      do: [
        { fade: ['sd', 'yn'], len: 0.25 },
        { quote: 'Chín năm làm một Điện Biên / Nên vành hoa đỏ, nên thiên sử vàng!', by: 'Tố Hữu, “Ba mươi năm đời ta có Đảng”', in: 'full', at: [0.5, 0.4], w: 0.96, size: 52, t0: 0.25, len: 0.7 },
      ],
    },
  ],

  // ===== Sơ đồ tập đoàn cứ điểm (đơn giản hoá, không theo tỉ lệ) — s.d1, s.d2, s.d3: ba đợt tiến công =====
  draw: {
    socuDiem({ ctx, r, p, s, text, arrow, U, T, SUB, clamp, easeOut }) {
      const HF = '"Patrick Hand", sans-serif', RED = SUB[1];
      const cx = r.x + r.w / 2, cy = r.y + r.h * 0.53, rx = r.w * 0.33, ry = r.h * 0.4;
      const A = (u, v) => [cx + u * rx, cy + v * ry];
      const k = easeOut(clamp(p * 1.4));
      ctx.save(); ctx.globalAlpha *= k;
      // núi bao quanh lòng chảo
      ctx.strokeStyle = T.muted; ctx.lineWidth = 3 * U; ctx.lineJoin = 'round';
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const x = cx + Math.cos(a) * rx * 1.22, y = cy + Math.sin(a) * ry * 1.16;
        ctx.beginPath(); ctx.moveTo(x - 15 * U, y + 9 * U); ctx.lineTo(x, y - 11 * U); ctx.lineTo(x + 15 * U, y + 9 * U); ctx.stroke(); }
      // lòng chảo Mường Thanh
      ctx.setLineDash([10 * U, 8 * U]); ctx.strokeStyle = T.ink; ctx.lineWidth = 3 * U; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      // sông Nậm Rốm
      ctx.strokeStyle = '#4A90B8'; ctx.lineWidth = 5 * U; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const v = -1.1 + (2.2 * i) / 40; const [x, y] = A(0.14 + 0.07 * Math.sin(v * 5), v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      text('sông Nậm Rốm', ...A(0.36, 0.46), { size: 28, weight: 400, font: HF, color: '#3C7FA6', align: 'left' });
      // sân bay Mường Thanh
      const [ax, ay] = A(-0.18, 0.02); ctx.fillStyle = 'rgba(125,115,96,0.35)'; ctx.fillRect(ax - 12 * U, ay - 80 * U, 24 * U, 160 * U);
      ctx.strokeStyle = T.muted; ctx.setLineDash([8 * U, 8 * U]); ctx.lineWidth = 2 * U; ctx.beginPath(); ctx.moveTo(ax, ay - 74 * U); ctx.lineTo(ax, ay + 74 * U); ctx.stroke(); ctx.setLineDash([]);
      text('sân bay', ax - 22 * U, ay + 46 * U, { size: 28, weight: 400, font: HF, color: T.muted, align: 'right' });
      // các cụm cứ điểm (chấm mực)
      const cluster = (u, v, n, rad) => { const [x, y] = A(u, v); ctx.fillStyle = T.ink;
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + u; ctx.beginPath(); ctx.arc(x + (n > 1 ? Math.cos(a) * rad * U : 0), y + (n > 1 ? Math.sin(a) * rad * U : 0), 8 * U, 0, Math.PI * 2); ctx.fill(); }
        return [x, y]; };
      const N = { him: cluster(0.5, -0.74, 3, 18), doc: cluster(0.02, -0.98, 2, 14), ban: cluster(-0.5, -0.76, 2, 14),
        tt: cluster(0.0, 0.08, 8, 34), dong: cluster(0.6, 0.02, 4, 26), nam: cluster(-0.02, 0.86, 4, 20) };
      const lab = (s0, [x, y], dx, dy, o = {}) => text(s0, x + dx * U, y + dy * U, { size: o.size || 30, weight: 400, font: HF, color: o.color || T.ink, align: o.align || 'center' });
      lab('Him Lam', N.him, 34, -6, { align: 'left' }); lab('Độc Lập', N.doc, 0, -36); lab('Bản Kéo', N.ban, -34, -6, { align: 'right' });
      lab('Mường Thanh', N.tt, 0, 66); lab('A1, C1, D1, E1', N.dong, 0, 54, { size: 26 }); lab('Hồng Cúm', N.nam, 0, 42);
      text('PHÂN KHU BẮC', ...A(-0.02, -0.6), { size: 22, weight: 800, color: T.muted });
      text('PHÂN KHU TRUNG TÂM', ...A(-0.02, -0.26), { size: 22, weight: 800, color: T.muted });
      text('PHÂN KHU NAM', ...A(-0.02, 0.6), { size: 22, weight: 800, color: T.muted });
      // nhãn bắt buộc: đây là sơ đồ vẽ lại, không phải tư liệu
      ctx.fillStyle = 'rgba(34,48,90,0.85)'; ctx.beginPath(); ctx.roundRect(r.x + 10 * U, r.y + 4 * U, 270 * U, 40 * U, 6 * U); ctx.fill();
      text('SƠ ĐỒ ĐƠN GIẢN HOÁ', r.x + 145 * U, r.y + 25 * U, { size: 22, weight: 800, color: '#fff' });
      ctx.restore();
      // ba đợt tiến công: mũi tên đỏ đánh vào, cụm cứ điểm bị xoá
      const strike = (q, arrows, targets) => {
        if (q <= 0) return;
        arrows.forEach(([u1, v1, u2, v2], i) => { const [x1, y1] = A(u1, v1), [x2, y2] = A(u2, v2); arrow(x1, y1, x2, y2, RED, easeOut(clamp(q * 1.6 - i * 0.15)), 8); });
        const xq = clamp(q * 2 - 1); if (xq <= 0) return;
        ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 7 * U; ctx.lineCap = 'round'; ctx.globalAlpha *= xq;
        targets.forEach(([x, y]) => { const d = 22 * U; ctx.beginPath(); ctx.moveTo(x - d, y - d); ctx.lineTo(x + d, y + d); ctx.moveTo(x + d, y - d); ctx.lineTo(x - d, y + d); ctx.stroke(); });
        ctx.restore();
      };
      strike(clamp(s.d1 || 0), [[0.98, -1.05, 0.58, -0.8], [0.25, -1.18, 0.06, -1.0], [-0.98, -1.05, -0.56, -0.8]], [N.him, N.doc, N.ban]);
      strike(clamp(s.d2 || 0), [[1.3, -0.35, 0.7, -0.06], [1.3, 0.42, 0.68, 0.1]], [N.dong]);
      strike(clamp(s.d3 || 0), [[0.95, 0.75, 0.16, 0.2], [-0.95, 0.6, -0.16, 0.18], [-0.9, -0.45, -0.14, -0.04], [0.0, 1.12, 0.0, 0.96]], [N.nam]);
      // cờ trên Mường Thanh khi kết thúc chiến dịch
      const fq = clamp((s.d3 || 0) * 2 - 1);
      if (fq > 0) { const [x, y] = N.tt; ctx.save(); ctx.globalAlpha *= fq; ctx.strokeStyle = T.ink; ctx.lineWidth = 4 * U;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 90 * U * fq); ctx.stroke();
        ctx.fillStyle = '#DA251D'; ctx.fillRect(x, y - 90 * U * fq, 66 * U, 44 * U);
        ctx.fillStyle = '#FFCD00'; ctx.beginPath(); const sx = x + 33 * U, sy = y - 90 * U * fq + 22 * U;
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr0 = i % 2 ? 6 * U : 15 * U; ctx.lineTo(sx + rr0 * Math.cos(a), sy + rr0 * Math.sin(a)); }
        ctx.closePath(); ctx.fill(); ctx.restore(); }
    },
  },
};
