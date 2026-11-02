# Scene API — bộ máy bài giảng

```js
module.exports = {
  size: [1080, 1920],          // mặc định khổ dọc TikTok; --size 1920x1080 khi render để ra bản ngang
  part: 'Phần 1/3',            // (tuỳ chọn) nhãn phần khi chia bài dài thành nhiều video
  subject: 'hoa',              // toan | ly | hoa | sinh | su | dia | van | gdktpl → tự chọn chế độ KHTN/KHXH
  mode: 'khtn',                // (tuỳ chọn) ép chế độ
  lesson: 'Hoá 12 · Tên bài theo SGK',
  channel: { name: '[TÊN KÊNH]', handle: '@tenkenh', next: 'Tên bài tiếp theo' },
  voiceDir: 'vo',              // tự nhận vo/00.mp3, vo/01.wav… theo số thứ tự beat
  music: 'bgm.mp3', musicVolume: 0.1,
  rate: 4.2, gap: 0.35,        // ước lượng độ dài khi chưa có giọng đọc
  endDur: 3,                   // thẻ kết; end: false để bỏ
  beats: [ { say: 'Câu đọc = phụ đề', do: [ /* hành động */ ], dur, anim, caption, speak } ],
  draw: { tenHienTuong(kit) { /* mô phỏng */ } },
};
```

**Vị trí** của mọi đồ vật: `in: 'visual' | 'panel' | 'full'` cộng với `at: [u, v]` (0..1, tương đối trong vùng). `rect: [u, v, w, h]` dùng cho ảnh, bản đồ hay đồ thị chỉ chiếm một phần vùng.
**Thời điểm** trong beat: các hành động mặc định chia đều thời gian `anim` theo thứ tự. Đặt `t0` (bắt đầu, 0..1) và `len` (độ dài, 0..1) để chồng lên nhau hoặc sắp lại.
**Riêng từng khổ**: thêm `portrait: { at, size, … }` hoặc `landscape: { … }` vào bất kỳ hành động nào để đổi vị trí hoặc cỡ khi render khổ đó. Thường cần cho các bài có nhiều dòng công thức khi đổi sang 9:16.
**Màu**: `'subject'` (màu môn), `'hl'` (cam nhấn), `'F' 'v' 'a' 'E' 'B'` (màu đại lượng), `'muted'`, hoặc mã màu `#…`.

## Dùng chung

| Hành động | Tác dụng |
|---|---|
| `{ chapter: 'PHẦN 1', title: '…' }` | thẻ mở đầu một phần, phủ kín màn hình (gỡ bằng `fade`) |
| `{ text, id, in, at, size, weight, color, align, font: 'hand' \| 'serif' }` | chữ hiện dần |
| `{ bullets: [...], id, in, at, size, from }` | danh sách hiện từng ý. `from: n` = n ý đầu đã có từ beat trước |
| `{ card: 'Tiêu đề', body: '…', id, in, at, w, size, color }` | thẻ khái niệm hoặc ghi nhớ, có vạch màu môn bên trái |
| `{ arrow: [[u1,v1],[u2,v2]], in, color, label }` | mũi tên |
| `{ highlight: 'id', color, label, pad }` | khung quanh một đồ vật đã có |
| `{ move: 'id', at: [u, v], in }` | dời đồ vật |
| `{ set: 'id', tenTrangThai: true }` | bật dần một trạng thái cho mô phỏng (`s.tenTrangThai` chạy 0 → 1) |
| `{ fade: 'id' \| [...] }` · `{ clear: true }` | gỡ đồ vật |

## KHTN

| Hành động | Tác dụng |
|---|---|
| `{ formula: 'TeX', id, in, at, size, align, color, reveal: 'wipe' \| 'fade' }` | công thức sắp chữ chuẩn (MathJax và mhchem), hiện kiểu quét từ trái sang phải |
| `{ swap: 'id', formula: 'TeX mới', size }` | biến đổi công thức tại chỗ |
| `{ plot: 'x*x - 2', x: [a, b], y: [c, d], in, rect, color }` | đồ thị vẽ dần, có lưới và trục |
| `{ draw: 'ten', id, in }` | gọi hàm `draw.ten(kit)` trong scene. `kit` gồm `ctx, r, tau, s, p, q, text, arrow, rr, U, T, Q, lerp, clamp, ease, easeOut` |

Macro màu dùng trong TeX: `\cF{}` `\cV{}` `\cA{}` `\cE{}` `\cB{}` `\hl{}`.

## KHXH

| Hành động | Tác dụng |
|---|---|
| `{ image: 'assets/a.jpg', id, in, rect, frame: 'photo', fit: 'cover' \| 'contain', kb: [[s,u,v],[s,u,v]], credit, ai: true \| 'HÌNH MINH HOẠ', tilt }` | ảnh có Ken Burns, dòng ghi nguồn, nhãn minh hoạ |
| `{ pin: 'imgId', at: [u, v], label, r, color, dx, dy }` | khoanh và gắn nhãn một điểm trên ảnh |
| `{ map: true, id, in, view: [lonT, latN, lonĐ, latB], to, highlight: { 704: 'subject' }, labels: [[lon, lat, 'nhãn', { dot, sea, size, color, dx, dy }]] }` | bản đồ Mercator từ Natural Earth. Hoàng Sa và Trường Sa luôn được vẽ |
| `{ mapTo: 'id', view, highlight, labels }` | camera bay tới khung mới, đổi tô màu, đổi nhãn |
| `{ timeline: [['năm', 'sự kiện'], ...], id, in, y, active }` | dòng thời gian (vùng rộng thì nằm ngang, vùng cao thì nằm dọc) |
| `{ tl: 'id', active: i }` | làm nổi mốc thứ i |
| `{ quote: 'trích nguyên văn', by: 'Tác giả, Tác phẩm', in, at, w, size }` | trích dẫn kiểu chữ có chân |

## Lệnh

```bash
node engine/render.js <bai>/scene.js                         # MP4 + sheet kiểm tra (ảnh cuối mỗi beat)
node engine/render.js <bai>/scene.js --stills 3,10,20         # chỉ chụp ảnh tĩnh để duyệt bố cục
node engine/render.js <bai>/scene.js --size 1920x1080         # cùng kịch bản, xuất bản YouTube ngang
```

Cài lần đầu: `cd engine && npm install && npm install playwright && npx playwright install chromium`. Máy cần có `ffmpeg`. Font được tải từ Google Fonts nên máy render cần có mạng.
