---
name: video-so-tay
description: Làm video học tập THPT theo phong cách "Sổ tay": một giao diện chung (giấy ngà chấm lưới, mực xanh đen, giấy note, băng dính, nét khoanh tay) dùng được cho cả video chữa bài có công thức tính toán (Vật lí, Hoá, Toán: công thức TeX chuẩn SGK, mô phỏng chạy đúng công thức, khoanh đáp số) lẫn video môn xã hội (Lịch sử, Địa lí: bản đồ có Hoàng Sa, Trường Sa, ảnh tư liệu thật in kiểu polaroid có ghi nguồn, sơ đồ, dòng thời gian, trích dẫn). Mặc định khổ dọc 9:16 cho TikTok/Shorts/Reels, xuất thêm 16:9 từ cùng kịch bản. Dùng khi người dùng muốn làm video chữa bài, giảng bài, video lịch sử, địa lí theo phong cách sổ tay, hoặc nói "làm video phong cách sổ tay", "video chữa bài lý", "video lịch sử có bản đồ và ảnh thật".
---

# Video học tập phong cách Sổ tay

Một phong cách cho **mọi loại bài**, để kênh luôn trông như một kênh:

- **Bài có công thức** (chữa bài Lý, Hoá, Toán): công thức sắp chữ chuẩn SGK bằng mực đậm, hình minh hoạ hoặc mô phỏng vẽ bằng nét mực, đáp số khoanh bằng khung kẻ tay.
- **Bài xã hội** (Sử, Địa): bản đồ in dán vào trang, ảnh tư liệu thật in kiểu polaroid có ghi nguồn, sơ đồ vẽ tay, dòng thời gian, trích dẫn nguyên văn.

Skill này **không có bộ máy riêng**. Nó dùng bộ máy của skill `bai-giang-thpt` (`../bai-giang-thpt/engine/render.js`) với `look: 'so-tay'`. Danh sách đầy đủ các hành động (`formula`, `swap`, `draw`, `map`, `image`, `pin`, `timeline`, `quote`, `card`…) nằm ở `../bai-giang-thpt/references/scene-api.md`.

Đọc trước khi làm:
- [references/phong-cach.md](references/phong-cach.md): bảng màu, chữ, các thành phần, bố cục khổ dọc, quy tắc màu đại lượng
- [references/anh-tu-lieu.md](references/anh-tu-lieu.md): ảnh thật lấy ở đâu, giấy phép nào dùng được, cách ghi nguồn, khung chờ khi chưa có ảnh
- `../bai-giang-thpt/references/khtn.md` (quy ước viết công thức) và `../bai-giang-thpt/references/khxh.md` (bản đồ, chủ quyền, ảnh)

## Chọn mẫu theo loại video

| Loại video | Khuôn bài | Mẫu để chép |
|---|---|---|
| **Chữa bài** (Lý, Hoá, Toán) | đề bài + hình → tóm tắt → công thức → thay số → đáp số khoanh → bẫy thường gặp | `mau/ly-roi-tu-do/scene.js` |
| **Thí nghiệm, hiện tượng** (Hoá, Lý) | mô phỏng → quan sát → phương trình → ví dụ tính → ghi nhớ | `../bai-giang-thpt/examples/hoa-natri-nuoc/scene.js` |
| **Lịch sử** | bản đồ định vị → sơ đồ → ảnh tư liệu → dòng thời gian diễn biến → kết quả, ý nghĩa → trích dẫn | `../bai-giang-thpt/examples/su-dien-bien-phu/scene.js` |
| **Địa lí** | bản đồ bay tới vùng → thẻ khái niệm → ảnh có ghim → dòng thời gian → ghi nhớ | `../bai-giang-thpt/examples/dia-vi-tri-viet-nam/scene.js` |

Một bài có thể trộn cả hai: ví dụ bài Địa lí có tính mật độ dân số vẫn dùng `formula` bình thường. Giao diện không đổi giữa chừng.

## Quy trình

1. **Chốt bài**: môn, lớp, tên bài theo SGK (GDPT 2018), loại video (bảng trên), độ dài 30–90 giây cho một ý.
2. **Kiểm tra kiến thức**: tự giải lại bài, đối chiếu mốc năm, số liệu với SGK. Đề chữa bài phải ghi nguồn (trung tâm tự soạn, đề minh hoạ hoặc đề chính thức của Bộ).
3. **Viết lời đọc theo beat**: mỗi beat một ý, dài 1,5–6 giây. Lời đọc cũng là phụ đề.
4. **Tạo thư mục bài** (ví dụ `videos/2026-11-ly-roi-tu-do/`), chép `scene.js` của mẫu phù hợp vào, giữ `look: 'so-tay'`, sửa nội dung.
5. **Chuẩn bị tư liệu** (bài xã hội): ảnh đặt trong `assets/`, nguồn và giấy phép ghi vào `assets/NGUON.md` (xem anh-tu-lieu.md). Chưa có ảnh vẫn dựng được: bộ máy hiện khung "ẢNH TƯ LIỆU · chờ ảnh".
6. **Duyệt bố cục bằng ảnh tĩnh**, mở ảnh ra xem và sửa chỗ chữ đè nhau, chữ tràn mép, nhãn chìm màu:
   `node .claude/skills/bai-giang-thpt/engine/render.js <bai>/scene.js --stills 5,12,20`
7. **Thêm giọng đọc** (`voiceDir: 'vo'`, file `vo/00.mp3`, `vo/01.mp3`… theo thứ tự beat; độ dài beat tự khớp giọng) và nhạc nền (`music`, `musicVolume`).
8. **Xuất video**: `node .claude/skills/bai-giang-thpt/engine/render.js <bai>/scene.js`. Bản YouTube ngang: thêm `--size 1920x1080`. Xem `sheet.jpg` (ảnh cuối mỗi beat) trong thư mục `_work`.
9. **Báo lại người dùng**: đường dẫn MP4, độ dài, khổ, nguồn tư liệu, và những chỗ còn để giữ chỗ (tên kênh, khung chờ ảnh, chưa có giọng).

Lần đầu trên máy mới: `cd .claude/skills/bai-giang-thpt/engine && npm install` (cần thêm `playwright` và Chromium nếu máy chưa có), và máy phải có `ffmpeg`. Font tải từ Google Fonts nên máy render cần có mạng.

## Không được phá

- **Luôn `look: 'so-tay'`** để mọi video cùng một giao diện. Đổi tên kênh ở `channel: { name, handle, next }`.
- **Công thức luôn viết bằng TeX** (dùng `String.raw\`...\``), dấu phẩy thập phân, đơn vị viết đứng. Đáp số bọc `\hl{}` và khoanh bằng `highlight`.
- **Màu đại lượng cố định**: lực `\cF`, vận tốc `\cV`, gia tốc `\cA`, điện trường hoặc năng lượng `\cE`, từ trường `\cB`. Trong hình vẽ thì dùng `Q.F`, `Q.v`, `Q.a`, `Q.E`, `Q.B`. Hàm vẽ tự viết lấy màu từ `T` và `Q`, không gắn cứng mã màu.
- **Mô phỏng chạy theo công thức thật**, không ước lượng bằng mắt. Ví dụ rơi tự do: y = ½gt².
- **Ảnh thật** in kiểu polaroid, luôn có dòng `credit`. **Hình vẽ lại** (sơ đồ, minh hoạ) phải gắn nhãn, ví dụ "SƠ ĐỒ ĐƠN GIẢN HOÁ" hoặc `ai: 'HÌNH MINH HOẠ'`. Không để hình vẽ trông như ảnh tư liệu.
- **Bản đồ có Biển Đông** phải có QĐ. Hoàng Sa và QĐ. Trường Sa (bộ máy tự vẽ), gọi là "Biển Đông".
- **Trích dẫn** (thơ, văn, luật) phải nguyên văn, ghi tác giả và tác phẩm.
- **Không đăng video còn khung "chờ ảnh"** hoặc còn chữ giữ chỗ "[TÊN KÊNH]".

## Bài mẫu

| Thư mục | Môn | Video mẫu |
|---|---|---|
| `mau/ly-roi-tu-do/` | Vật lí 10: chữa bài rơi tự do | `demo/ly-roi-tu-do-9x16.mp4` |
| `../bai-giang-thpt/examples/hoa-natri-nuoc/` | Hoá 12: Na + nước | `../bai-giang-thpt/demo/hoa-natri-nuoc-so-tay-9x16.mp4` |
| `../bai-giang-thpt/examples/dia-vi-tri-viet-nam/` | Địa lí 12: vị trí Việt Nam | `../bai-giang-thpt/demo/dia-vi-tri-viet-nam-so-tay-9x16.mp4` |
| `../bai-giang-thpt/examples/su-dien-bien-phu/` | Lịch sử 12: Điện Biên Phủ | `../bai-giang-thpt/demo/su-dien-bien-phu-so-tay-9x16.mp4` |
