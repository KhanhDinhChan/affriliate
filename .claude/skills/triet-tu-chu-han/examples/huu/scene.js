// Ví dụ: triết tự chữ 休 (Hưu – nghỉ ngơi) = 亻(người) + 木(cây). Khổ dọc 9:16 cho TikTok/Shorts/Reels.
// Dựng: node ../../scripts/render.js scene.js
// Có giọng đọc: thêm `audio: 'vo/00.mp3'` vào từng beat (độ dài beat sẽ theo đúng file âm thanh).
const oval = (cx, cy, rx, ry, n = 40) => Array.from({ length: n + 1 }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)]);

module.exports = {
  size: [1080, 1920],
  fps: 30,
  theme: 'paper',
  beats: [
    {
      say: 'Hôm nay mình triết tự chữ Hưu, nghĩa là nghỉ ngơi.',
      do: [
        { text: 'TRIẾT TỰ CHỮ HÁN', y: 150, size: 44, color: 'sub', len: 0.2 },
        { text: '休 · Hưu · xiū', id: 'head', y: 230, size: 64, bold: true, at: 0.1, len: 0.25 },
        { write: '休', x: 540, y: 650, size: 620, at: 0.2, len: 0.8 },
      ],
    },
    { say: 'Chữ này ghép từ hai phần, mình tách ra xem nhé.', do: [{ split: '休' }] },
    { say: 'Bên trái là bộ Nhân đứng, tức là con người.', do: [{ label: '休', comp: 0, text: '亻', sub: 'nhân · người' }] },
    { say: 'Bên phải là chữ Mộc, nghĩa là cái cây.', do: [{ label: '休', comp: 1, text: '木', sub: 'mộc · cây' }] },
    {
      say: 'Hãy hình dung một người đang tựa lưng vào gốc cây.',
      do: [
        { char: '休', focus: null, len: 0.2 },
        {
          id: 'pic', at: 0.1, len: 0.9, width: 9,
          sketch: [
            [[250, 1500], [830, 1500]],                                   // mặt đất
            [[592, 1500], [596, 1300]], [[624, 1500], [620, 1300]],         // thân cây
            oval(608, 1215, 145, 92),                                      // tán cây
            oval(532, 1352, 28, 28, 24),                                   // đầu
            [[544, 1380], [580, 1470]],                                    // lưng tựa vào thân cây
            [[580, 1470], [495, 1438], [425, 1497]],                       // chân duỗi
            [[548, 1398], [508, 1442]],                                    // tay đặt lên gối
          ],
        },
      ],
    },
    {
      say: 'Người tựa gốc cây, chính là lúc được nghỉ ngơi.',
      do: [
        { fade: 'pic', len: 0.3 },
        { merge: '休', at: 0.15, len: 0.4 },
        { text: '亻 + 木 = 休', id: 'formula', y: 1260, size: 110, bold: true, at: 0.5, len: 0.4 },
      ],
    },
    {
      say: 'Từ hay gặp: hưu tức là nghỉ ngơi, thoái hưu là nghỉ hưu.',
      do: [
        { fade: 'formula', len: 0.2 },
        { text: '休息  hưu tức · nghỉ ngơi', y: 1190, size: 58, at: 0.2, len: 0.35 },
        { text: '退休  thoái hưu · nghỉ hưu', y: 1290, size: 58, at: 0.6, len: 0.35 },
      ],
    },
  ],
};
