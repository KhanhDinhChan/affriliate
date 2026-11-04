// Ví dụ KHXH · Địa lí 12 — Vị trí địa lí Việt Nam. Khổ dọc 9:16 (Shorts / TikTok / Reels).
// Dựng: node ../../engine/render.js scene.js
// Mẫu cho mọi bài KHXH: BẢN ĐỒ / ẢNH để định vị → THẺ KHÁI NIỆM → ẢNH có ghim chú thích → DÒNG THỜI GIAN → GHI NHỚ.
// Bản đồ vẽ từ dữ liệu Natural Earth; bộ máy luôn tự vẽ QĐ. Hoàng Sa và QĐ. Trường Sa cùng màu lãnh thổ Việt Nam.

module.exports = {
  size: [1080, 1920],
  subject: 'dia',
  look: 'so-tay', // giao diện Sổ tay chung cho mọi môn; bỏ dòng này để về giao diện cũ (nền sáng phẳng)
  lesson: 'Địa lí 12 · Vị trí địa lí và phạm vi lãnh thổ',
  channel: { next: 'Đặc điểm chung của địa hình Việt Nam' },
  beats: [
    {
      say: 'Việt Nam nằm ở rìa phía đông bán đảo Đông Dương, gần trung tâm khu vực Đông Nam Á.',
      do: [
        { map: true, id: 'm', in: 'visual', view: [55, -12, 155, 52], to: [95, 5, 125, 25], highlight: { 704: 'subject' } },
        { text: 'Vị trí địa lí Việt Nam', id: 'h1', in: 'panel', at: [0.5, 0.18], size: 60, weight: 800, t0: 0.3, len: 0.5 },
      ],
    },
    {
      say: 'Phía bắc giáp Trung Quốc, phía tây giáp Lào và Campuchia, phía đông và phía nam giáp Biển Đông.',
      do: [{
        mapTo: 'm', view: [95, 5, 125, 25],
        labels: [[109.5, 24, 'TRUNG QUỐC', { size: 30, color: 'muted' }], [102.6, 19.2, 'LÀO', { size: 30, color: 'muted' }],
          [104.9, 12.7, 'CAMPUCHIA', { size: 28, color: 'muted' }], [100.6, 15.6, 'THÁI LAN', { size: 26, color: 'muted' }],
          [105.85, 21.03, 'Hà Nội', { dot: true, size: 30 }], [119.2, 13.2, 'Biển Đông', { sea: true, size: 40, color: '#2B6CB0' }]],
      }],
    },
    {
      say: 'Vùng biển nước ta có hàng nghìn đảo lớn nhỏ, trong đó có hai quần đảo xa bờ là Hoàng Sa và Trường Sa.',
      do: [{ mapTo: 'm', view: [102, 6, 120, 23], labels: [[105.85, 21.03, 'Hà Nội', { dot: true, size: 30 }], [117.6, 13.4, 'Biển Đông', { sea: true, size: 40, color: '#2B6CB0' }]] }],
    },
    {
      say: 'Vị trí này khiến thiên nhiên nước ta mang tính chất nhiệt đới ẩm gió mùa: giàu tài nguyên nhưng cũng nhiều thiên tai.',
      do: [
        { fade: 'h1', len: 0.2 },
        { card: 'Ý nghĩa của vị trí', body: 'Nằm trong vùng nhiệt đới, chịu tác động của gió mùa → thiên nhiên nhiệt đới ẩm gió mùa: tài nguyên phong phú nhưng nhiều thiên tai (bão, lũ).', id: 'y', in: 'panel', at: [0.5, 0.45], size: 40, t0: 0.2, len: 0.6 },
      ],
    },
    {
      say: 'Ở vùng núi phía Bắc, người dân làm ruộng bậc thang trên sườn đồi để giữ nước và hạn chế xói mòn.',
      do: [
        { fade: ['m', 'y'], len: 0.25 },
        { image: 'assets/ruong-bac-thang-minh-hoa.jpg', id: 'img', in: 'visual', frame: 'photo', ai: 'HÌNH MINH HOẠ', kb: [[1.0, 0.5, 0.5], [1.18, 0.62, 0.62]],
          credit: 'Hình minh hoạ vẽ bằng code · kênh thật dùng ảnh tư liệu, ghi rõ nguồn', t0: 0.15, len: 0.4 },
        { pin: 'img', at: [0.32, 0.72], label: 'ruộng bậc thang', r: 50, t0: 0.55, len: 0.2 },
        { pin: 'img', at: [0.79, 0.55], label: 'nhà sàn', r: 40, color: 'subject', dy: 80, t0: 0.75, len: 0.2 },
        { bullets: ['Giữ nước cho lúa trên đất dốc', 'Hạn chế xói mòn, rửa trôi'], id: 'rb', in: 'panel', at: [0.02, 0.2], size: 42, t0: 0.6, len: 0.4 },
      ],
    },
    {
      say: 'Ba mốc pháp lý quan trọng về biển, đảo mà em cần nhớ.',
      do: [
        { fade: ['img', 'rb'], len: 0.25 },
        { text: 'Mốc pháp lý về biển, đảo', id: 'h2', in: 'visual', at: [0.5, 0.08], size: 52, weight: 800, t0: 0.2, len: 0.3 },
        { timeline: [['1982', 'Công ước Liên hợp quốc về Luật Biển'], ['1994', 'Việt Nam phê chuẩn Công ước'], ['2012', 'Quốc hội thông qua Luật Biển Việt Nam']],
          id: 'tl', in: 'visual', y: 0.58, t0: 0.35, len: 0.65 },
      ],
    },
    {
      say: 'Luật Biển Việt Nam năm 2012 quy định rõ: quần đảo Hoàng Sa và quần đảo Trường Sa thuộc chủ quyền Việt Nam.',
      do: [
        { tl: 'tl', active: 2, len: 0.3 },
        { card: 'Ghi nhớ', body: 'Luật Biển Việt Nam (2012) xác định QĐ. Hoàng Sa, QĐ. Trường Sa thuộc chủ quyền Việt Nam.', in: 'panel', at: [0.5, 0.45], size: 40, t0: 0.3, len: 0.6 },
      ],
    },
  ],
};
