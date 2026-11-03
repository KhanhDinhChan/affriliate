# Rơi tự do: 4 video thử phong cách (khổ dọc 9:16)

Cùng một chủ đề, làm theo 4 phong cách đã chọn cho dự án Vật Lý. Cả 4 video dùng chung bộ nhận diện trong `lib.js`: logo, nhãn tuyến, phụ đề, thanh tiến độ, thẻ kết và bảng màu đại lượng.

| File | Phong cách | Tuyến | Độ dài | Nội dung |
|---|---|---|---|---|
| `v1-ghi-chep-ve-tay.html` | Ghi chép vẽ tay | Hiểu bản chất | 19 s | Búa và lông chim, trong không khí và trong chân không, dẫn tới a = g |
| `v2-nen-den-cong-nghe.html` | Nền đen công nghệ | Hiểu bản chất | 20 s | Thí nghiệm Apollo 15 trên Mặt Trăng (1971), so sánh g ở Trái Đất và Mặt Trăng |
| `v3-so-do-quy-trinh.html` | Sơ đồ quy trình phẳng | Giải nhanh 30 giây | 22 s | Bài tập h = 45 m tính ra t = 3 s, v = 30 m/s, kèm bẫy quên lấy căn. Đề do trung tâm tự soạn |
| `v4-chu-gameshow.html` | Chữ gameshow | Sai lầm kinh điển | 20 s | Đố vui: quả tạ 5 kg hay bóng tennis chạm đất trước |

Video thành phẩm nằm ở `out/*.mp4`.

## Số liệu đã kiểm tra

- **Bài tập ở video 3:** t = √(2·45/10) = 3 s, v = 10·3 = 30 m/s.
- **So sánh ở video 2:** g Mặt Trăng ≈ 1,62 m/s², nhỏ hơn khoảng 6 lần so với Trái Đất. Thả từ 1,5 m thì t = √(2h/g) cho 0,55 s ở Trái Đất và 1,36 s ở Mặt Trăng. Độ cao 1,5 m là ví dụ minh hoạ, không phải độ cao thật trong thí nghiệm.
- **Chuyển động trong video:** vật rơi theo đúng y = ½gt² (đã làm chậm theo tỉ lệ). Ở video 3, vật rơi đúng 3 giây thật.

## Âm thanh và giọng đọc

`amthanh.py` tạo nhạc nền và hiệu ứng bằng code, khớp mốc thời gian trong từng file HTML. Lệnh dưới đây ghi ra `out/v1.wav` đến `out/v4.wav`:

```bash
python3 amthanh.py
```

**Video chưa có giọng đọc.** Khi đã thu giọng (giọng thầy cô, hoặc TTS như edge-tts `vi-VN-NamMinhNeural`), chạy lệnh sau. Nhớ chỉnh mốc thời gian trong `CAPS` cho khớp với giọng thật:

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js v1-ghi-chep-ve-tay.html out/v1-ghi-chep-ve-tay.mp4 --audio giong-v1.mp3 --music out/v1.wav --music-volume 0.5
```

## Xuất lại video

Chụp ảnh tĩnh để duyệt bố cục:

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js v1-ghi-chep-ve-tay.html out/v1.mp4 --stills 2,6,12
```

Xuất video kèm âm thanh:

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js v1-ghi-chep-ve-tay.html out/v1-ghi-chep-ve-tay.mp4 --audio out/v1.wav
```

Font được tải từ Google Fonts: Be Vietnam Pro, Patrick Hand, Playfair Display và Baloo 2, đều có dấu tiếng Việt. Vì vậy máy render cần có mạng.

Trước khi đăng, sửa `BRAND` trong `lib.js` thành tên trung tâm, tên kênh và số Zalo thật.
