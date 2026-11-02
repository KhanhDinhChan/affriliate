---
name: video-vat-ly
description: Làm video ngắn quảng bá trung tâm học thêm Vật Lý (TikTok, Reels, Shorts, Facebook) theo 5 tuyến nội dung — Hiểu bản chất (mô phỏng), Giải nhanh 30 giây (bảng phấn), Trên lớp hôm nay, Hành trình học viên, Tuyển sinh — với một hệ nhận diện chung (bảng màu đại lượng vật lý, font Be Vietnam Pro, logo, phụ đề, thẻ kết). Dùng khi người dùng muốn làm video, lên kịch bản, lên lịch đăng hay chỉnh phong cách đồ hoạ cho trung tâm Vật Lý, hoặc nói "video giải đề lý", "video mô phỏng vật lý", "video tuyển sinh lớp lý".
---

# Video quảng bá trung tâm Vật Lý

Tài liệu chiến lược nằm ở `references/`, còn `templates/` chứa 3 template HTML chạy được, mỗi template tương ứng một phong cách đồ hoạ. Tất cả template dùng chung `templates/lib.js`, nơi định nghĩa thương hiệu, bảng màu đại lượng, vùng an toàn, phụ đề và thẻ kết.

- [references/tuyen-noi-dung.md](references/tuyen-noi-dung.md): 5 tuyến nội dung, phễu, kho đề tài, lịch tuần và lịch theo mùa, công thức mở đầu 3 giây, CTA
- [references/phong-cach-do-hoa.md](references/phong-cach-do-hoa.md): bộ gen thương hiệu, bảng màu đại lượng, 3 lớp vỏ, quy tắc bố cục 9:16, âm thanh
- [references/cong-cu.md](references/cong-cu.md): nên cài skill nào trong awesome-claude-video-skills cho tuyến nào, và những gì không nên dùng

## Chọn template theo tuyến

| Tuyến | Template | Nội dung cần sửa |
|---|---|---|
| ① Hiểu bản chất / Sai lầm kinh điển | `templates/lab.html` | object `C` (chữ, phụ đề) và phần MÔ PHỎNG (công thức chuyển động) |
| ② Giải nhanh 30 giây | `templates/board.html` | `C.question`, `equation`, `options`, `correct`, `marks`, `steps`, `note` |
| ④ Hành trình học viên / ⑤ Tuyển sinh | `templates/promo.html` | `C.hook`, `promises`, `bars` (**số thật**, rồi đặt `sample: false`), `info` |
| ③ Trên lớp hôm nay | quay thật, dựng bằng skill editor (xem cong-cu.md) | dùng chung logo, phụ đề, thẻ kết |

## Quy trình làm một video

1. **Chọn tuyến và đề tài** trong kho đề tài ([tuyen-noi-dung.md](references/tuyen-noi-dung.md)). Viết câu mở đầu 3 giây trước tiên.
2. **Viết lời đọc** thành từng câu ngắn, mỗi câu từ 1,5 đến 5 giây. Mỗi câu đi cùng đúng một hành động trên màn hình. Lời đọc cũng chính là phụ đề.
3. **Kiểm tra kiến thức**: công thức, số liệu và đáp án phải đúng. Với tuyến ①, mô phỏng phải chạy theo công thức thật, không ước lượng bằng mắt. Với tuyến ②, tự giải lại bài và ghi nguồn đề.
4. **Chép template** sang thư mục video mới (ví dụ `videos/2026-11-tuan1-nem-ngang/`), chép kèm `lib.js` rồi sửa object `C`. Chỉnh mốc thời gian để khớp với lời đọc. Nếu đã có file giọng đọc thì lấy mốc từ file đó.
5. **Chụp ảnh tĩnh để duyệt bố cục** trước khi xuất video:
   `node scripts/html2mp4.js <video>/lab.html --stills 1,4,8,12`
   Kiểm tra các điểm sau: chữ không tràn mép, không có gì nằm trong vùng bị giao diện TikTok che (`SAFE` trong lib.js), mỗi khung hình chỉ có một màu nhấn cam, và vectơ dùng đúng màu đại lượng.
6. **Xuất video**: `node scripts/html2mp4.js <video>/lab.html out.mp4 --audio giong.mp3 --music nhac.mp3`. Script tự giải mã lại toàn bộ file để chắc chắn video không lỗi.
7. **Báo lại cho người dùng**: đường dẫn MP4, độ dài, tuyến nội dung, câu mở đầu, gợi ý mô tả và hashtag, cùng những chỗ còn để giữ chỗ (tên trung tâm, số Zalo, số liệu mẫu).

Lần đầu chạy trên máy mới: `cd scripts && npm install && npx playwright install chromium`. Máy cũng cần có `ffmpeg`. Font được tải từ Google Fonts nên máy render cần có mạng (hoặc cài sẵn font Be Vietnam Pro và Pangolin).

## Nguyên tắc không được phá

- **Chữ, công thức và số liệu luôn do code vẽ**, không để mô hình tạo ảnh viết.
- **Số liệu kết quả, lời nhận xét và hình ảnh học sinh phải là thật** và có đồng ý của phụ huynh (học sinh là trẻ vị thành niên). Không bịa lời khen hay điểm số.
- **Đề thi phải có nguồn**: đề do trung tâm tự soạn, hoặc đề minh hoạ, đề chính thức của Bộ.
- **Bảng màu đại lượng là cố định**: lực F màu đỏ hồng, vận tốc v màu cyan, gia tốc a màu tím, điện trường E màu vàng, từ trường B màu xanh lá.
- **Thẻ kết giống nhau ở mọi video**, để người xem nhận ra thương hiệu.

Kết quả mẫu nằm ở `demo/`, gồm 3 video và các ảnh tĩnh.
