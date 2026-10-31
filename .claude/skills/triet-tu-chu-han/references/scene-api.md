# Scene API

`scene.js` xuất ra một object. Tất cả toạ độ tính bằng pixel của khung hình (mặc định 1080×1920).

```js
module.exports = {
  size: [1080, 1920],      // [1920, 1080] cho YouTube ngang
  fps: 30,
  theme: 'paper',          // 'paper' (giấy + đỏ son) | 'board' (bảng đen phấn)
  voiceDir: 'vo',          // tự nhận vo/00.mp3, vo/01.wav… theo số thứ tự beat
  music: 'bgm.mp3',        // tuỳ chọn, tự lặp lại và nhỏ dần ở cuối
  musicVolume: 0.12,
  rate: 4.2,               // âm tiết/giây để ước lượng độ dài khi chưa có giọng đọc
  gap: 0.35,               // khoảng nghỉ sau mỗi câu
  lead: 0.3, tail: 1.2,    // khoảng trống đầu và cuối video
  captions: true,          // false = không vẽ phụ đề (khi muốn tự thêm phụ đề trong CapCut)
  beats: [ /* ... */ ],
};
```

## Beat

```js
{
  say: 'Câu đọc, đồng thời dùng làm phụ đề.',
  speak: 'Cách đọc cho TTS (tuỳ chọn), dùng khi muốn TTS đọc khác chữ hiển thị.',
  caption: 'Phụ đề khác với say (tuỳ chọn).',
  audio: 'vo/03.mp3',      // tuỳ chọn; mặc định lấy từ voiceDir
  dur: 3,                  // tuỳ chọn; ép độ dài beat (giây)
  anim: 2.5,               // tuỳ chọn; các hành động diễn ra trong anim giây đầu (mặc định 85% dur)
  do: [ /* hành động */ ],
}
```

Các hành động trong `do` chạy **lần lượt**, chia đều thời gian `anim`. Có thể đặt `at` (điểm bắt đầu, 0..1) và `len` (độ dài, 0..1) để chồng chúng lên nhau hoặc sắp lại thứ tự.

## Hành động

| Hành động | Tác dụng |
|---|---|
| `{ write: '休', x, y, size, grid, ghost, color }` | Viết chữ từng nét theo đúng thứ tự. Nét chưa viết hiện mờ (`ghost`), phía sau có ô mễ tự (`grid`). `color: 'component'` (mặc định, mỗi bộ phận một màu) \| `'ink'` \| mã màu. |
| `{ show: '休', ... }` | Hiện ngay cả chữ (mờ dần vào). |
| `{ split: '休', gap: 0.2 }` | Tách các bộ phận ra xa nhau (đơn vị là tỉ lệ cỡ chữ). Hướng tách theo cấu tạo: ⿰ tách ngang, ⿱ tách dọc. |
| `{ label: '休', comp: 0, text: '亻', sub: 'nhân · người', pos: 'top', focus: true }` | Đặt nhãn dưới (hoặc trên) bộ phận thứ `comp`, đồng thời làm mờ các phần còn lại. |
| `{ char: '休', focus: null }` | Bỏ làm mờ. Truyền `focus: 1` để chỉ làm nổi bộ phận 1. |
| `{ merge: '休' }` | Ghép các bộ phận lại, nhãn mờ dần. |
| `{ move: '休', x, y, size }` | Di chuyển hoặc phóng to thu nhỏ chữ. |
| `{ text, id, x, y, size, color, bold, align }` | Chữ hiện dần từng ký tự. `color` nhận tên trong theme (`ink`, `sub`) hoặc mã màu. |
| `{ sketch: [[x,y],...] \| [[[x,y],...], ...], id, width, color }` | Vẽ nét tay dần dần (que diêm, mũi tên, khoanh tròn). |
| `{ image: 'co-van/xiu-jiagu.png', id, x, y, w, h }` | Ảnh (tự dạng cổ, tranh minh hoạ) mờ dần vào. |
| `{ fade: 'id' \| ['id1','id2'] }` | Làm mờ rồi xoá một text, sketch, ảnh hoặc chữ. |
| `{ clear: true }` | Xoá sạch khung. |

`id` của chữ mặc định là chính chữ đó. Nếu cùng một chữ xuất hiện hai lần thì đặt `id` riêng cho mỗi lần.

## Bộ phận (component) đến từ đâu

`fetch-char.js` lưu trường `matches` của Make Me a Hanzi: mỗi nét thuộc về bộ phận thứ mấy trong `decomposition`. Ví dụ 休 có cấu tạo `⿰亻木`, với `matches = [[0],[0],[1],[1],[1],[1]]`, nghĩa là 2 nét đầu thuộc 亻 và 4 nét sau thuộc 木. Với chữ ba tầng như ⿰氵⿱… thì bộ phận được tính ở cấp đầu tiên.

Muốn tách theo cách khác, sửa `matches` trong `data/<chữ>.json`. Đây là tệp riêng của dự án nên có thể sửa tay.

## Lệnh

```bash
node scripts/fetch-char.js <dự-án>/data 休 好 明    # tải và in cấu tạo, từ nguyên
node scripts/render.js <dự-án>/scene.js [out.mp4]   # mặc định ghi vào <dự-án>/out/scene.mp4
node scripts/voice-edge.js <dự-án>/scene.js vi-VN-NamMinhNeural +5%
```
