# Phong cách Sổ tay: quy chuẩn hình ảnh

Ý tưởng: mỗi video là **một trang vở** của thầy cô. Công thức viết bằng mực, hình vẽ bằng nét bút, còn ảnh thật và bản đồ được in ra dán vào trang bằng băng dính. Nhờ vậy cùng một giao diện chứa được cả bài toán lẫn bài lịch sử, và học sinh phân biệt ngay đâu là **tư liệu thật** (ảnh polaroid kèm nguồn), đâu là **hình vẽ minh hoạ** (nét mực).

## Bảng màu

| Vai trò | Màu | Ghi chú |
|---|---|---|
| Nền giấy | `#F4F0E6` | chấm lưới mờ cách 48 px, vân giấy, tối nhẹ ở viền |
| Mực (chữ, công thức, nét vẽ) | `#22305A` | xanh đen |
| Chữ phụ | `#6E6656` | nâu xám |
| Giấy note, phụ đề | `#FFFDF7` | có bóng đổ mềm |
| Băng dính | `#EEDC9E`, trong 80% | |
| Màu nhấn | cam `#FF8A1F` | **chỉ dùng cho đáp số, điều cần nhớ nhất**, mỗi khung một chỗ |
| Màu môn | Toán `#4F46E5` · Lý `#0284C7` · Hoá `#059669` · Sinh `#65A30D` · Sử `#B91C1C` · Địa `#0F766E` · Văn `#7C3AED` · GDKT&PL `#D97706` | nhãn môn, vạch màu thẻ, thanh tiến độ, vùng tô trên bản đồ |

### Màu đại lượng (tông đậm để đọc rõ trên giấy)

| Đại lượng | Trong công thức | Trong hình vẽ | Màu |
|---|---|---|---|
| Lực F | `\cF{}` | `Q.F` | `#E11D48` |
| Vận tốc v | `\cV{}` | `Q.v` | `#0891B2` |
| Gia tốc a | `\cA{}` | `Q.a` | `#7C3AED` |
| Điện trường E, năng lượng | `\cE{}` | `Q.E` | `#B45309` |
| Từ trường B | `\cB{}` | `Q.B` | `#15803D` |
| Quỹ đạo, đường phụ, kích thước | | `Q.s` | `#64748B` |

Trên bản đồ, nếu tô cả lãnh thổ Việt Nam bằng màu môn đậm thì nhãn cùng màu sẽ chìm. Khi đó tô **tông nhạt** (ví dụ Sử dùng `'#EDB7AE'`) và để nhãn quan trọng màu môn đậm.

## Chữ

| Dùng cho | Font |
|---|---|
| Tiêu đề, thẻ, phụ đề, nhãn trên bản đồ | Be Vietnam Pro (700–800) |
| Công thức | MathJax (TeX), chữ có chân chuẩn SGK |
| Chữ viết tay: nhãn ghim, chú thích trên hình, `text` với `font: 'hand'` | Patrick Hand |
| Trích dẫn thơ văn | Noto Serif nghiêng |

Cỡ chữ tối thiểu ở khổ dọc: tiêu đề 56, nội dung 36, chú thích trên hình 28, phụ đề 48.

## Thành phần

| Thành phần | Trông như | Hành động |
|---|---|---|
| Thẻ ghi nhớ, đề bài, bẫy thường gặp | giấy note có vạch màu môn bên trái, băng dính ở trên | `card` (đặt `color: 'hl'` cho thẻ "Bẫy") |
| Ảnh tư liệu | ảnh in polaroid, hơi nghiêng, băng dính, dòng nguồn trên viền | `image` (+ `credit`, `kb` để zoom chậm) |
| Ghim trên ảnh | vòng khoanh tay + nhãn chữ viết tay | `pin` |
| Bản đồ | in trên giấy trắng, hai băng dính góc trên | `map`, `mapTo` |
| Sơ đồ, mô phỏng | nét mực vẽ bằng code, có nhãn "SƠ ĐỒ ĐƠN GIẢN HOÁ" nếu là hình vẽ lại sự kiện | `draw` (hàm trong `scene.js`) |
| Dòng thời gian | đường mực, mốc tròn màu môn | `timeline`, `tl` |
| Khoanh đáp số | khung kẻ tay 4 nét màu cam | `highlight` |
| Phụ đề | dải giấy trắng có bóng, chữ mực | tự động từ `say` |
| Tên kênh | chữ mực trên băng dính | `channel.name` |

## Bố cục khổ dọc 1080×1920

- **Vùng hình** (`visual`): y 330–870. Dùng cho hình vẽ, mô phỏng, bản đồ, sơ đồ.
- **Vùng chữ** (`panel`): y 880–1380. Dùng cho công thức, thẻ, dòng thời gian, ảnh nhỏ.
- **Toàn khung** (`full`): y 330–1370. Dùng cho trích dẫn hoặc ảnh lớn.
- **Phụ đề**: quanh y 1470. Không đặt gì quan trọng dưới y 1540, vì giao diện TikTok che phần đó.
- **Chữa bài**: hình ở `visual`. Các dòng công thức xếp dọc trong `panel` (`at: [0, 0.08] → 0.34 → 0.62 → 0.86`, `align: 'left'`), cỡ 50–56.
- **Bài xã hội**: bản đồ hoặc sơ đồ ở `visual`. Thẻ, ảnh, dòng thời gian ở `panel`. Sơ đồ ở `visual` có thể giữ suốt bài trong khi `panel` đổi nội dung.

## Chuyển động

- Đồ vật xuất hiện trong 0,2–0,6 giây, kiểu chậm dần (bộ máy tự làm).
- Mỗi beat một thay đổi chính, khoảng 2–3 giây lại có một thay đổi nhìn thấy được.
- Ghim, khung nhấn và mũi tên xuất hiện **sau khi** lời đọc nhắc tới. Chỉnh bằng `t0` và `len` trong beat.
- Mô phỏng dùng `set` để bật trạng thái theo lời đọc (ví dụ `{ set: 'sim', drop: true }`). Trạng thái chạy tuyến tính từ 0 đến 1 trong khoảng `len`.
