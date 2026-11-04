---
name: bai-giang-thpt
description: Làm video bài giảng cho kênh học tập THPT, mọi môn — KHTN (Toán, Lý, Hoá, Sinh) với công thức sắp chữ chuẩn SGK bằng TeX/MathJax (cả phương trình hoá học mhchem), biến đổi từng bước, đồ thị và mô phỏng hiện tượng; KHXH (Sử, Địa, Văn, GDKT&PL) với ảnh tư liệu có ghi nguồn, ghim chú thích, bản đồ (tự vẽ Hoàng Sa, Trường Sa), dòng thời gian, trích dẫn. Mặc định khổ dọc 9:16 để đăng TikTok/Shorts/Reels; cùng kịch bản xuất thêm 16:9 cho YouTube. Dùng khi người dùng muốn làm video giảng bài, giải thích kiến thức, chữa bài, hay hỏi về quy chuẩn hình ảnh của kênh học tập THPT.
---

# Video bài giảng THPT

Bộ máy trong `engine/` dựng video từ một tệp `scene.js`: lời đọc chia thành beat, mỗi beat có các hành động vẽ. Kênh có **một khung chung** (nhãn môn, phụ đề, thanh tiến độ, thẻ kết) và **hai chế độ**:

- **KHTN** (`toan`, `ly`, `hoa`, `sinh`): nền bảng tối, công thức TeX sắp chữ chuẩn, `swap`/`move`/`highlight` để biến đổi từng bước, `plot` vẽ đồ thị, `draw` mô phỏng hiện tượng theo quy luật thật.
- **KHXH** (`su`, `dia`, `van`, `gdktpl`): nền sáng, `image` (Ken Burns, ghi nguồn, nhãn minh hoạ), `pin` chú thích trên ảnh, `map` vẽ từ Natural Earth (luôn có QĐ. Hoàng Sa, QĐ. Trường Sa), `timeline`, `quote`.

**Giao diện chung khuyên dùng: `look: 'so-tay'`.** Giấy ngà, mực xanh đen, công thức sắp chữ bằng mực đậm, ảnh thật in kiểu polaroid có ghi nguồn, bản đồ in dán vào trang, thẻ ghi nhớ như giấy note. Một giao diện dùng được cho cả bài có công thức và bài có bản đồ, ảnh thật. Chi tiết ở mục "Giao diện Sổ tay" trong quy-chuan-chung.md.

Đọc trước khi làm:
- [references/quy-chuan-chung.md](references/quy-chuan-chung.md): màu môn, bố cục hai khổ, phụ đề, cấu trúc Shorts và bài giảng dài, danh sách kiểm tra trước khi đăng
- [references/khtn.md](references/khtn.md): quy ước viết công thức (dấu phẩy thập phân, đơn vị, mhchem), macro màu, cách cho công thức chạy, ngữ pháp mô phỏng
- [references/khxh.md](references/khxh.md): ba loại ảnh và nhãn bắt buộc, nguồn ảnh hợp pháp, bản đồ và chủ quyền, dòng thời gian, gợi ý từng môn
- [references/tiktok.md](references/tiktok.md): **khổ dọc mặc định**, độ dài, chia phần, vùng an toàn, cỡ chữ tối thiểu, hook 3 giây, phụ đề, hashtag
- [references/scene-api.md](references/scene-api.md): toàn bộ hành động và lệnh

## Quy trình

1. **Xác định bài**: môn, lớp, tên bài theo SGK (chương trình GDPT 2018), và 1–3 mục tiêu. Khổ mặc định là **9:16 cho TikTok**, mỗi video 30–90 giây một ý. Bài dài thì chia phần (`part: 'Phần 1/3'`).
2. **Kiểm tra kiến thức trước**: công thức, số liệu, mốc năm và trích dẫn đều phải đối chiếu SGK hoặc nguồn chính thống. Ghi chú các "bẫy thường gặp".
3. **Viết lời đọc theo beat**: mỗi beat là một ý, dài 1,5–6 giây. Theo khuôn KHTN *hiện tượng → công thức → ví dụ → ghi nhớ*, hoặc khuôn KHXH *bản đồ/ảnh → khái niệm → diễn biến → ý nghĩa*.
4. **Chuẩn bị tư liệu (KHXH)**: ảnh để trong `assets/`, ghi nguồn và giấy phép vào `assets/NGUON.md`. Ảnh không phải tư liệu thật phải gắn `ai`.
5. **Viết `scene.js`**: chép một bài mẫu trong `examples/` rồi sửa.
   Ảnh chưa có thì bộ máy hiện khung "ẢNH TƯ LIỆU · chờ ảnh" để duyệt bố cục trước. Không đăng video còn khung chờ.
6. **Duyệt bố cục bằng ảnh tĩnh**: chạy `node engine/render.js <bai>/scene.js --stills ...`, mở ảnh ra xem và sửa.
7. **Thêm giọng đọc** (`voiceDir`), **render**, mở `sheet.jpg`, rồi chạy qua danh sách kiểm tra trong quy-chuan-chung.md.
8. Báo lại cho người dùng: đường dẫn MP4, độ dài, khổ, nguồn tư liệu đã dùng, và những chỗ còn để giữ chỗ.

## Bài mẫu

| Thư mục | Môn | Khổ | Minh hoạ |
|---|---|---|---|
| `examples/hoa-natri-nuoc/` | Hoá 12 | 9:16 (và 16:9 từ cùng kịch bản) | mô phỏng Na + nước, phương trình mhchem, tô màu chất, bài tính có khoanh đáp số, `portrait` chỉnh riêng cho khổ dọc |
| `examples/dia-vi-tri-viet-nam/` | Địa lí 12 | 9:16 | bản đồ bay từ châu Á về Việt Nam, Hoàng Sa và Trường Sa, ảnh có ghim, dòng thời gian |
| `examples/su-dien-bien-phu/` | Lịch sử 12 | 9:16 | bản đồ định vị Điện Biên Phủ, sơ đồ tập đoàn cứ điểm vẽ tay có mũi tên từng đợt tiến công, khung ảnh tư liệu (chờ ảnh), dòng thời gian 3 đợt, thẻ kết quả và ý nghĩa, trích thơ nguyên văn |

Hai bài mẫu đã bật `look: 'so-tay'`. Video mẫu và ảnh tổng hợp nằm ở `demo/`: các file `*-so-tay-*` là giao diện Sổ tay, các file còn lại là giao diện cũ.

## Không được phá

- Công thức luôn viết bằng TeX, không gõ thành chữ thường. Dùng dấu phẩy thập phân kiểu Việt Nam.
- Ảnh luôn có ghi nguồn. Ảnh AI hoặc hình vẽ lại **không bao giờ** được trông như tư liệu thật, nhất là ảnh nhân vật và sự kiện lịch sử.
- Bản đồ có Biển Đông phải có QĐ. Hoàng Sa và QĐ. Trường Sa thuộc Việt Nam, và gọi tên là "Biển Đông".
- Trích văn bản (thơ, văn, luật) phải trích nguyên văn, ghi rõ tác giả hoặc tên văn bản và số điều.
