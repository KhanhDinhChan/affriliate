# Quy chuẩn chung của kênh

Kênh dạy mọi môn THPT nhưng phải trông như **một kênh**. Mọi video dùng chung một khung, một kiểu chữ, một kiểu phụ đề và một thẻ kết. Bên trong khung, mỗi nhóm môn có một **chế độ** riêng.

## 1. Hai chế độ

| | **KHTN** — Toán, Vật lý, Hoá học, Sinh học | **KHXH** — Lịch sử, Địa lí, Ngữ văn, GDKT & PL |
|---|---|---|
| Nhiệm vụ của hình | thấy **công thức** từng bước, thấy **hiện tượng** vận hành | thấy **ảnh, bản đồ, mốc thời gian**, để học sinh hình dung bối cảnh |
| Nền | bảng tối `#0F1726` có lưới mờ, công thức sáng nổi rõ | nền sáng `#F2F4F7`, ảnh và bản đồ giữ đúng màu thật |
| Đồ vật chính | `formula`, `swap`, `move`, `highlight`, `plot`, `draw` (mô phỏng) | `image` (có `pin`), `map`, `timeline`, `quote`, `card` |
| Chi tiết | [khtn.md](khtn.md) | [khxh.md](khxh.md) |

Chế độ được chọn tự động theo `subject`. Có thể ép chế độ khác bằng `mode: 'khtn' | 'khxh'`, ví dụ khi một bài Địa lí có nhiều tính toán.

### Giao diện Sổ tay (`look: 'so-tay'`): khuyên dùng

Chế độ quyết định **đồ vật nào** được dùng. Giao diện quyết định **trông ra sao**. Với `look: 'so-tay'`, cả hai chế độ dùng chung **một** giao diện, nên Lý, Hoá, Sử, Địa trông như cùng một kênh. Bài có cả công thức lẫn bản đồ, ảnh cũng không bị "đổi kênh" giữa chừng.

| Thành phần | Trong giao diện Sổ tay |
|---|---|
| Nền | giấy ngà `#F4F0E6`, chấm lưới mờ, vân giấy |
| Chữ và công thức | mực xanh đen `#22305A`. TeX sắp chữ bằng mực đậm. Màu đại lượng (`\cF` `\cV` `\cA` `\cE` `\cB`) chuyển sang tông đậm để đọc rõ trên giấy |
| Ảnh thật | luôn in kiểu ảnh polaroid (viền trắng, bóng đổ, băng dính), dòng ghi nguồn nằm trên viền ảnh. Muốn bỏ khung thì đặt `frame: 'none'` |
| Bản đồ | in trên giấy trắng dán vào trang bằng băng dính. Đất liền màu giấy, Việt Nam tô màu môn, luôn có QĐ. Hoàng Sa và QĐ. Trường Sa |
| Thẻ ghi nhớ, phụ đề | giấy note có bóng và băng dính |
| Ghim, khung nhấn | vòng khoanh và khung kẻ bằng nét tay. Nhãn ghim viết bằng chữ tay (Patrick Hand) |
| Phân biệt ảnh thật và hình minh hoạ | ảnh thật: polaroid kèm nguồn. Hình vẽ: nét mực hoặc gắn nhãn `ai: 'HÌNH MINH HOẠ'`. Không để hình vẽ trông như ảnh tư liệu |

Bỏ `look` thì quay về giao diện cũ: KHTN nền bảng tối, KHXH nền sáng phẳng. Hàm mô phỏng tự viết nên lấy màu từ `T` và `Q` trong `kit` (`T.ink`, `T.glass`, `T.bubble`, `Q.v`…) thay vì gắn cứng mã màu, để chạy đúng ở mọi giao diện.

## 2. Màu môn học (nhãn ở đầu video, thanh tiến độ, đường viền thẻ)

| Môn | Mã | Màu |
|---|---|---|
| Toán | `toan` | chàm `#4F46E5` |
| Vật lý | `ly` | xanh trời `#0284C7` |
| Hoá học | `hoa` | lục bảo `#059669` |
| Sinh học | `sinh` | xanh cốm `#65A30D` |
| Lịch sử | `su` | đỏ son `#B91C1C` |
| Địa lí | `dia` | xanh biển sâu `#0F766E` |
| Ngữ văn | `van` | tím `#7C3AED` |
| GDKT & PL | `gdktpl` | hổ phách `#D97706` |

Màu nhấn của kênh là **cam `#FF8A1F`**, dành cho đáp số, ý chính, ghim trên ảnh và nút "Theo dõi". Mỗi khung hình chỉ dùng **một chỗ** màu cam.

## 3. Hai khổ video, một tệp kịch bản

Tác giả đặt đồ vật vào **vùng** (`in: 'visual' | 'panel' | 'full'`) với toạ độ tương đối `at: [u, v]` (0..1). Bộ máy tự xếp các vùng theo khổ:

| Khổ | `visual` (hình) | `panel` (chữ, công thức) | Dùng cho |
|---|---|---|---|
| **9:16** 1080×1920 — **mặc định** | nửa trên | nửa dưới | TikTok, Shorts, Reels 30–90 giây (xem [tiktok.md](tiktok.md)) |
| **16:9** 1920×1080 | nửa trái | nửa phải | bản YouTube ngang, bài giảng 5–12 phút |

Đổi khổ khi render: `--size 1920x1080` để ra bản ngang (mặc định là dọc). Cùng một kịch bản cho ra hai video. **Luôn chụp ảnh tĩnh sau khi đổi khổ**: vùng chữ ở khổ dọc thấp hơn, nên bài có nhiều dòng công thức sẽ chật. Khi đó thêm `portrait: { at, size }` vào các hành động cần chỉnh (xem bài mẫu Hoá).

Ở khổ dọc, mọi nội dung nằm trong **vùng an toàn**: dưới mép trên 150 px (tab của ứng dụng che), phụ đề đặt ở 76% chiều cao, và không để chữ quan trọng xuống dưới y ≈ 1540.

## 4. Phụ đề và lời đọc

- Lời đọc (`say`) cũng là phụ đề. Câu dài được tự chia thành từng cụm 2 dòng và hiện lần lượt.
- Mỗi beat là một ý, dài 1,5–6 giây. Hình xuất hiện **đúng lúc** lời đọc nhắc tới.
- Đọc công thức bằng lời tự nhiên ("n natri bằng 2,3 chia 23"), còn trên màn hình hiện ký hiệu chuẩn. Khi cần cách đọc khác chữ hiển thị, dùng `speak` (xem phần giọng đọc của skill triet-tu-chu-han).
- Giọng đọc: chọn một giọng duy nhất cho cả kênh. Giọng thật của người dạy là tốt nhất. Nếu dùng TTS thì chọn edge-tts `vi-VN-HoaiMyNeural` hoặc `NamMinhNeural`, FPT.AI hay Vbee. Lưu ý Kokoro chưa có tiếng Việt.

## 5. Cấu trúc bài

**Shorts 30–90 giây (một ý)**
1. Mở đầu 3 giây: một câu hỏi, một hiện tượng lạ, hoặc "câu này hay sai".
2. Hình: hiện tượng, bản đồ hoặc ảnh.
3. Giải thích: công thức, hoặc 2–3 ý.
4. Ghi nhớ: một thẻ.
5. Thẻ kết: "Bài tiếp".

**Bài giảng 5–12 phút (một bài trong SGK)**
1. Mở đầu và mục tiêu bài học (3 ý).
2. Các phần, mỗi phần mở bằng thẻ `chapter`.
3. Mỗi phần theo khuôn của nhóm môn: KHTN là *hiện tượng → công thức → ví dụ → bẫy thường gặp*; KHXH là *bối cảnh (ảnh, bản đồ) → diễn biến (dòng thời gian) → ý nghĩa → liên hệ*.
4. Tóm tắt bằng sơ đồ hoặc thẻ ghi nhớ.
5. Câu hỏi tự luyện, có đáp án ở cuối video hoặc phần mô tả.

## 6. Đúng chương trình, đúng kiến thức

- Bám **chương trình GDPT 2018** và SGK hiện hành. Ghi tên bài theo SGK trong `lesson`.
- Dùng thuật ngữ và ký hiệu như SGK. Ví dụ Hoá học dùng **đkc (25 °C, 1 bar), 24,79 L/mol**, không dùng đktc cũ. Chính tả là "Địa lí" theo cách viết của SGK.
- Mỗi số liệu, mốc năm và trích dẫn phải tra lại SGK hoặc nguồn chính thống trước khi dựng.
- Ghi chú các điểm dễ sai vào kịch bản và trình bày thành phần "bẫy thường gặp".

## 7. Kiểm tra trước khi đăng

- [ ] Chụp ảnh tĩnh (`--stills`) và mở xem `sheet.jpg`: không có chữ tràn mép, không có gì đè lên nhau, không có gì lọt vào vùng bị che.
- [ ] Công thức đúng, đơn vị đúng, dấu phẩy thập phân đúng kiểu Việt Nam (2,3, không viết 2.3).
- [ ] Mọi ảnh đều có dòng ghi nguồn. Ảnh không phải tư liệu thật có nhãn "HÌNH MINH HOẠ" hoặc "ẢNH MINH HOẠ AI".
- [ ] Bản đồ có Biển Đông thì phải có QĐ. Hoàng Sa và QĐ. Trường Sa (bộ máy tự vẽ, nhưng vẫn cần mở ảnh ra xem).
- [ ] Nghe hết video ít nhất một lần, xem lại 0,5 giây cuối. Render xong, script tự giải mã toàn bộ file để kiểm tra lỗi.
