# Lịch sử của máy tính: phong cách giấy cắt dán

Video ngắn khổ dọc 9:16 dùng cho YouTube Shorts và TikTok (dự án 2, kênh xã hội).

- **`out/lich-su-may-tinh.mp4`:** bản 51 giây, chỉ có hình vẽ, âm lượng khoảng -15 LUFS.
- **Bản mới, dài 64,5 giây:** mỗi thời kỳ mở đầu bằng **ảnh thật** in kiểu polaroid. Ảnh hiện khoảng 1,5 giây rồi thu nhỏ, ghim cạnh số năm, sau đó hình vẽ diễn tiếp. Bản này đang chờ ảnh: xem danh sách và quy định giấy phép trong [`anh/README.md`](anh/README.md).

## Phong cách

- **Nền và giấy:** nền giấy nhàu. Mọi hình là mảnh giấy cắt có bóng đổ và vân giấy, mép xé, băng dính dán góc.
- **Chuyển động:** giật kiểu stop-motion 12 hình/giây.
- **Chữ:** số năm in đậm (Anton), nhãn kiểu máy in nhãn (Roboto Slab), ghi chú viết tay màu đỏ (Patrick Hand). Cả ba font đều có dấu tiếng Việt.
- **Hình minh hoạ:** **toàn bộ vẽ bằng code**, không dùng ảnh có bản quyền.

## Nội dung

| Thời gian | Thời kỳ | Hình minh hoạ |
|---|---|---|
| 0–4 s | Mở đầu | Tiêu đề cắt dán, bánh răng, con chip, điện thoại, hạt bàn tính |
| 4–8,5 s | Cổ đại | Bàn tính, các hạt gỗ trượt |
| 8,5–13 s | 1642 | Máy cộng Pascal, bánh xe số đếm lên 001642 |
| 13–17,5 s | 1837 | Máy giải tích của Babbage, bánh răng quay, thẻ đục lỗ (Ada Lovelace, 1843) |
| 17,5–23 s | 1946 | ENIAC: 5 tủ máy, bóng đèn nhấp nháy, bóng người đứng cạnh để so kích thước |
| 23–27,5 s | 1947 | Bóng đèn điện tử chuyển sang bóng bán dẫn |
| 27,5–32 s | 1971 | Chip 4004 dưới kính lúp (2.300 transistor) |
| 32–36,5 s | 1981 | Máy tính cá nhân, gõ chữ trên màn hình xanh |
| 36,5–41 s | 1991 | Quả địa cầu nối mạng, cửa sổ trình duyệt "www" |
| 41–45,5 s | 2007 | Smartphone, các biểu tượng ứng dụng bật ra |
| 45,5–48,3 s | Hôm nay | ENIAC 27 tấn so với điện thoại 200 g, dấu đỏ "MẠNH HƠN HÀNG TRIỆU LẦN" |
| 48,3–51 s | Kết | "TẬP SAU: Lịch sử Internet", nút ĐĂNG KÝ |

## Số liệu

- Pascal làm máy cộng năm 1642.
- Babbage mô tả Máy giải tích năm 1837; ghi chép của Ada Lovelace là năm 1843.
- ENIAC công bố năm 1946, nặng khoảng 27 tấn, dùng khoảng 17.468 bóng đèn điện tử ("gần 18.000").
- Transistor ra đời tại Bell Labs năm 1947.
- Intel 4004 (1971) có khoảng 2.300 transistor.
- IBM PC ra mắt năm 1981.
- World Wide Web mở cho công chúng năm 1991.
- 2007 là năm smartphone cảm ứng bùng nổ (iPhone).
- "Mạnh hơn hàng triệu lần": ENIAC làm khoảng 5.000 phép cộng mỗi giây, điện thoại ngày nay làm hàng tỉ phép tính mỗi giây.

## Sửa và xuất lại

- **Tên kênh:** đổi hằng `CHANNEL` trong `lich-su-may-tinh.html`.
- **Lời dẫn và phụ đề:** sửa mảng `CAPS`.
- **Âm thanh:** chạy lệnh sau để ghi ra `out/nen.wav` (nhạc lo-fi, tiếng giấy và hiệu ứng). Script dùng lại bộ âm trong `../2026-11-roi-tu-do/amthanh.py`.

```bash
python3 amthanh.py
```

- **Xuất lại video:**

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js lich-su-may-tinh.html out/lich-su-may-tinh.mp4 --audio out/nen.wav
```

- **Chuẩn hoá âm lượng:**

```bash
ffmpeg -i out/lich-su-may-tinh.mp4 -af loudnorm=I=-15:TP=-1.5 -c:v copy out/final.mp4
```

- **Thêm giọng đọc:** thay `--audio out/nen.wav` bằng `--audio giong.mp3 --music out/nen.wav --music-volume 0.5`, rồi chỉnh mốc thời gian trong `CAPS` cho khớp với giọng.
