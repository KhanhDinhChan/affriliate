# Ảnh tư liệu thật: lấy ở đâu, dùng thế nào

## Nguồn

| Nguồn | Có gì | Ghi chú |
|---|---|---|
| Wikimedia Commons (commons.wikimedia.org) | ảnh lịch sử, địa danh, hiện vật, chân dung | giấy phép ghi ở mục "Licensing" trên trang từng ảnh |
| Ảnh trung tâm tự chụp | lớp học, thí nghiệm, đồ dùng, thực địa | tốt nhất, không lo bản quyền. Ảnh có học sinh phải được phụ huynh đồng ý |
| Bảo tàng, cơ quan lưu trữ có kho ảnh mở | tư liệu lịch sử | chỉ dùng ảnh ghi rõ phạm vi công cộng hoặc giấy phép mở |

**Máy cloud của Claude Code:** proxy mạng mặc định chặn Wikimedia (`commons.wikimedia.org`, `upload.wikimedia.org`). Muốn Claude tự tìm và tải ảnh, người dùng phải mở mạng: ở thanh tiêu đề phiên, mở menu môi trường cloud, chọn Edit, vào Network access, thêm hai tên miền trên vào Allowed domains (giữ ô Allow package managers). Có thể phải mở phiên mới thì thay đổi mới có hiệu lực. Nếu không mở mạng, người dùng tải ảnh rồi gửi vào cuộc trò chuyện.

## Giấy phép (kênh có gắn affiliate nên được tính là dùng thương mại)

| Giấy phép | Dùng được? | Phải làm gì |
|---|---|---|
| Phạm vi công cộng (Public domain), CC0 | được | nên vẫn ghi nguồn |
| CC BY | được | ghi tên tác giả và giấy phép trên ảnh (`credit`) và trong mô tả video |
| CC BY-SA | được, nhưng có điều kiện chia sẻ lại cùng giấy phép | ghi nguồn. Nên tìm ảnh khác nếu có |
| CC BY-NC, không ghi giấy phép, ảnh báo chí, ảnh lấy từ Google Ảnh | **không** | |

## Cách đưa ảnh vào bài

1. Đặt ảnh vào `assets/` của bài, đặt tên ngắn không dấu (ví dụ `dien-bien-phu-1954.jpg`). Cạnh dài khoảng 1200–1600 px là đủ.
2. Ghi vào `assets/NGUON.md`: tên file, nội dung, tác giả, nơi lấy (đường dẫn trang ảnh), giấy phép.
3. Trong `scene.js`:
   ```js
   { image: 'assets/dien-bien-phu-1954.jpg', id: 'img', in: 'panel', rect: [0.08, 0.02, 0.84, 0.82],
     credit: 'Ảnh: <tác giả> · <giấy phép> · Wikimedia Commons', kb: [[1, 0.5, 0.5], [1.1, 0.55, 0.45]] }
   ```
   `kb` là zoom chậm (Ken Burns): từ tỉ lệ 1 ở tâm ảnh tới tỉ lệ 1,1 lệch về điểm cần chú ý.
4. Ghim chú thích lên chi tiết trong ảnh: `{ pin: 'img', at: [u, v], label: '…' }`, trong đó `u`, `v` là toạ độ 0..1 trên ảnh gốc.

## Khi chưa có ảnh

Bộ máy vẫn dựng được video và hiện khung **"ẢNH TƯ LIỆU · chờ ảnh: <tên file>"** đúng chỗ ảnh sẽ vào. Lúc dựng, cửa sổ lệnh in ra cảnh báo `! Chưa có ảnh`. Dùng khung chờ để duyệt bố cục, **không đăng** video còn khung chờ.

## Không được làm

- Không ghi một ảnh là "tư liệu năm X" khi chưa xác minh được ảnh đó chụp ở đâu, khi nào. Nhiều ảnh lịch sử nổi tiếng là ảnh dựng lại sau sự kiện; nếu dùng thì ghi đúng như vậy.
- Không dùng ảnh tạo bằng AI để thay ảnh tư liệu lịch sử. Hình vẽ lại phải có nhãn "HÌNH MINH HOẠ" hoặc "SƠ ĐỒ ĐƠN GIẢN HOÁ".
- Không cắt bỏ hay che dòng ghi nguồn.
