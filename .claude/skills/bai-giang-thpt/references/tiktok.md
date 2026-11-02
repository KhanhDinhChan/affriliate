# Đăng TikTok — khổ dọc là mặc định

Kênh làm **9:16 trước**: mọi `scene.js` để `size: [1080, 1920]`, và bộ máy cũng mặc định khổ này. Khi cần bản YouTube ngang thì render thêm từ cùng kịch bản bằng `--size 1920x1080`.

## Thông số xuất

| Mục | Giá trị |
|---|---|
| Khung hình | 1080 × 1920, 30 khung/giây |
| Định dạng | MP4, H.264, yuv420p, AAC (bộ máy xuất sẵn đúng chuẩn này) |
| Độ dài | **30–90 giây** cho một ý (dễ được đề xuất nhất). Có thể tới khoảng 3 phút cho một dạng bài. Dài hơn thì **chia thành nhiều phần** |
| Chia phần | đặt `part: 'Phần 1/3'` trong scene, nhãn sẽ hiện trên đầu video. Đăng các phần cách nhau 1 ngày và ghim phần 1 lên trang kênh |

## Vùng an toàn trên TikTok

Giao diện TikTok che mất:
- khoảng **150 px trên cùng** (tab "Đang theo dõi / Dành cho bạn");
- khoảng **20% phía dưới** (tên kênh, mô tả, âm thanh);
- **cột nút bên phải** từ khoảng giữa màn hình trở xuống.

Bộ máy đã đặt logo, nhãn môn, nội dung và phụ đề ngoài các vùng này. Khi tự thêm đồ vật:
- không đặt `at` khiến chữ rơi xuống dưới y ≈ 1540;
- không đặt chữ quan trọng sát mép phải ở nửa dưới màn hình.

## Cỡ chữ tối thiểu ở khổ dọc

Học sinh xem trên điện thoại, nên chữ trong khung 1080 px rộng phải đạt:
- **phụ đề 48** (mặc định);
- **chữ thường, ý gạch đầu dòng, thẻ ≥ 40**;
- **công thức ≥ 54**;
- tiêu đề ≥ 56.

Nhỏ hơn thì xem trên điện thoại sẽ khó đọc.

## 3 giây đầu và ảnh bìa

- Khung hình đầu tiên phải đã có **chữ hook** (một câu hỏi, một hiện tượng lạ, hoặc "câu này 80% học sinh sai"). TikTok dùng khung này làm ảnh bìa trên lưới video.
- Không mở đầu bằng logo hay lời chào. Hãy vào thẳng câu hỏi.
- Beat đầu tiên nên ngắn (2–4 giây) và có chuyển động ngay: bản đồ bay, chất rơi vào cốc, công thức hiện ra.

## Phụ đề và âm thanh

- Phụ đề đã được **gắn cứng** vào video. Khi đăng, **tắt phụ đề tự động** của TikTok để không bị hai lớp chữ chồng lên nhau.
- Giọng đọc phải rõ. Nhạc nền chỉ 8–12% âm lượng giọng. Nếu dùng nhạc thịnh hành của TikTok thì thêm trong ứng dụng khi đăng, không trộn sẵn vào file.

## Mô tả, hashtag, chuỗi bài

- Mô tả: một câu nêu kiến thức, kèm câu hỏi kéo bình luận. Ví dụ: *"Na thả vào nước sẽ xảy ra hiện tượng gì? Bình luận đáp án bài tự luyện nhé!"*
- Hashtag: 3–5 thẻ, ví dụ `#hoctap #thpt #onthitotnghiep #hoahoc12 #LearnOnTikTok`.
- Đặt tên chuỗi theo môn hoặc theo dạng bài ("Hoá 12 trong 60 giây", "Địa lí 12 — bản đồ dễ nhớ") và gom vào **danh sách phát (Playlist)** trên trang kênh.
- Cuối video hỏi một câu tự luyện, rồi trả lời ở video sau hoặc trong bình luận ghim.

## Kiểm tra riêng cho TikTok

- [ ] Render khổ dọc. Mở `sheet.jpg` và soát từng khung theo vùng an toàn ở trên.
- [ ] Bài có nhiều dòng công thức: đã thêm `portrait: { at, size }` để các dòng không đè nhau.
- [ ] Khung đầu có chữ hook. Độ dài trong khoảng mục tiêu, hoặc đã chia phần.
- [ ] Đã tắt phụ đề tự động khi đăng.
