---
name: video-3d-vat-ly
description: Làm video 3D giải thích hiện tượng vật lí (THPT, nhất là lớp 11–12) kiểu phim tài liệu khoa học. Dựng cảnh bằng Blender (gói Python bpy, Cycles chạy CPU, không cần card đồ hoạ). Chuyển động tính đúng từ phương trình vật lí. Hiệu ứng có xuyên thấu vỏ máy, mặt cắt, đường sức và dòng điện phát sáng, mũi tên vectơ 3D. Video luôn có một ĐOẠN GIẢI THÍCH 2D riêng dùng mũi tên đại lượng, đồ thị và công thức TeX, cùng phụ đề điện ảnh, hạt phim và âm thanh tổng hợp. Mặc định khổ dọc 9:16 (TikTok, Shorts, Reels), dài 40–60 giây. Dùng khi người dùng muốn "làm video 3D", "video blender", "giải thích hiện tượng bằng 3D", "video kiểu phim tài liệu khoa học", hoặc đưa một hiện tượng (bếp từ, máy biến áp, cầu vồng, sạc không dây…) cần dựng 3D.
---

# Video 3D giải thích hiện tượng vật lí

Video của skill này mở đầu bằng một **hiện tượng đời thường quay đẹp như phim**, sau đó **xuyên vào bên trong** để thấy cơ chế. Tiếp theo là một **đoạn 2D riêng** giải thích bằng đại lượng vật lí: mũi tên, đồ thị, công thức. Cuối cùng quay lại 3D để **kiểm chứng** và chốt bằng chuỗi nguyên nhân → kết quả.

Đã làm bằng skill này (xem để học cách dựng):

| Video | Kiểu | Thư mục |
|---|---|---|
| Bếp từ: vì sao nồi nóng mà mặt bếp không nóng? (60 s) | **Điện ảnh**: nền tối, máy quay lướt, xoá phông, xuyên thấu, mặt cắt | `videos/2026-11-bep-tu/` |
| Thả nam châm vào ống đồng (39 s) | **Thí nghiệm**: phông sáng, hai thí nghiệm đặt cạnh nhau để so sánh | `videos/2026-11-nam-cham-ong-dong/` |

Đọc trước khi làm:
- [references/kich-ban.md](references/kich-ban.md): khung kịch bản 2 kiểu, phân đoạn theo giây, cách viết phụ đề, chủ đề gợi ý
- [references/blender.md](references/blender.md): cài đặt, thư viện `scripts/bpy3d.py`, công thức ánh sáng, vật liệu, máy quay, hiệu ứng, thời gian xuất
- [references/giai-thich-2d.md](references/giai-thich-2d.md): đoạn giải thích 2D (thư viện `scripts/overlay.js`), màu đại lượng, mũi tên, đồ thị, công thức, vùng an toàn

## Thành phần

| File | Việc |
|---|---|
| `scripts/bpy3d.py` | Thư viện dựng cảnh: vật liệu, hình khối, cuộn dây, đường sức, mũi tên 3D, mặt cắt, phông tối hoặc sáng, máy quay, giải phương trình chuyển động, vòng xuất khung chạy lại được |
| `scripts/overlay.js` | Thư viện lớp phủ: chiếu khung 3D, chuyển cảnh, phụ đề điện ảnh, nhãn, vectơ, ⊙ ⊗, hệ trục, đồ thị, công thức, chuỗi tóm tắt, thẻ kết, hạt phim |
| `scripts/tex.js` | Sắp chữ công thức TeX thành SVG (MathJax của skill `bai-giang-thpt`) |
| `scripts/am.py` | Âm thanh tổng hợp bằng numpy: chuyển cảnh, nhấn, nhạc nền trầm, tiếng sôi, rì rì điện, nam châm hút… |
| `scripts/chay-nen.sh` | Xuất các cảnh 3D tách khỏi phiên (không bị dừng sau 2 giờ) |
| `scripts/tien-do.sh` | Báo số khung đã xong và ước tính thời gian còn lại |
| `mau/` | Video mẫu "Con lắc đơn" 24 s chạy được ngay: `blender/canh.py`, `video.html`, `cong-thuc.js`, `amthanh.py` |

Bộ ghép video dùng chung với skill `video-vat-ly`: `.claude/skills/video-vat-ly/scripts/html2mp4.js`.

## Quy trình

1. **Chốt hiện tượng và kiểu video** (điện ảnh hay thí nghiệm, xem kich-ban.md). Viết **chuỗi vật lí** trước, mỗi mắt xích một câu, ví dụ: dòng xoay chiều → từ trường biến thiên → dòng Foucault → toả nhiệt. Chuỗi này quyết định cảnh 3D nào cần dựng.
2. **Viết kịch bản theo giây**: bảng gồm cảnh, thời gian, phụ đề, hình. Đoạn giải thích 2D dài 12–20 giây. Cảnh 3D gồm 3–5 cú máy, mỗi cú 4–8 giây.
3. **Tạo thư mục** `videos/<năm>-<tháng>-<chu-de>/`, chép toàn bộ `mau/` vào, chép thêm `scripts/overlay.js` vào cạnh `video.html`.
4. **Dựng cảnh 3D** trong `blender/canh.py`:
   - Đặt `DUR = {cảnh: giây}` và hàm `setup(shot, t)` cho từng cú máy.
   - Chuyển động tính bằng `B.integrate` hoặc công thức nghiệm, không ước lượng bằng mắt.
5. **Thử từng cú máy bằng vài khung** ở độ phân giải thấp, rồi mở ảnh ra xem:
   ```bash
   python canh.py --shot S1 --frames 0 --res 360x640 --samples 8 --out /tmp/thu/S1
   ```
   - Thử ít nhất khung đầu, khung giữa và khung cuối của mỗi cảnh.
   - Kiểm tra vật chính có trong khung, nét đúng chỗ, không cháy sáng, và vật mà phụ đề nhắc tới có xuất hiện.
6. **Xuất thật, chạy nền**:
   ```bash
   BPY_PYTHON=<python có bpy> bash .claude/skills/video-3d-vat-ly/scripts/chay-nen.sh videos/<thu-muc> "S1 S2 S3"
   ```
   - Theo dõi bằng `tien-do.sh`.
   - Trong lúc chờ, làm song song bước 7 và 8.
7. **Làm lớp phủ** trong `video.html`:
   - Khai báo `SHOTS`, `CAPS`.
   - Viết đoạn `explain(t)` 2D, thêm nhãn trên cảnh 3D và thẻ kết.
   - Sắp công thức: `node .claude/skills/video-3d-vat-ly/scripts/tex.js videos/<thu-muc>/cong-thuc.js`.
   - Duyệt ảnh tĩnh: `node .claude/skills/video-vat-ly/scripts/html2mp4.js video.html --stills 2,8,15,30`. Khung 3D chưa xuất xong sẽ hiện ô xám "chưa có khung 3D".
8. **Âm thanh**: sửa `amthanh.py` cho khớp mốc thời gian, rồi chạy `python3 amthanh.py` để tạo `out/nen.wav`.
9. **Ghép và chuẩn hoá âm lượng**:
   ```bash
   node .claude/skills/video-vat-ly/scripts/html2mp4.js video.html out/v.mp4 --audio out/nen.wav
   ffmpeg -i out/v.mp4 -c:v copy -af loudnorm=I=-15:TP=-1.5 out/<ten>.mp4
   ```
10. **Kiểm tra thành phẩm**:
    - Rút 8–12 khung (`ffmpeg -ss <giây> -i out/<ten>.mp4 -frames:v 1 x.png`) và xem từng khung.
    - Đặc biệt soi chỗ chuyển cảnh và nhãn đè lên vật 3D.
    - Viết `README.md` cho video: bảng phân đoạn, vật lí trong video, lệnh dựng lại.
11. **Báo lại người dùng**:
    - Đường dẫn MP4, độ dài, khổ.
    - Phần nào là minh hoạ phóng đại.
    - Chỗ còn để giữ chỗ (tên kênh "[TÊN KÊNH]", chưa có giọng đọc).

**Cài đặt lần đầu** (chi tiết ở blender.md):

```bash
python3 -m venv <scratchpad>/bpyenv && <scratchpad>/bpyenv/bin/pip install bpy
```

- Cần Python đúng phiên bản mà `bpy` yêu cầu (bpy 5.x dùng Python 3.13).
- Node cần có `playwright` (máy này đã có Chromium sẵn) và `ffmpeg`.
- Cần MathJax: `cd .claude/skills/bai-giang-thpt/engine && npm install`.

## Không được phá

- **Đoạn giải thích 2D là bắt buộc**, dài 12–20 giây, đặt sau khi đã thấy bên trong và trước cảnh kiểm chứng.
  - Đoạn này phải có ít nhất **mũi tên đại lượng** hoặc **đồ thị**, và một **công thức** của SGK.
  - Hình 3D đẹp mà không giải thích bằng đại lượng thì chưa phải bài giảng.
- **Vật lí đúng**:
  - Chuyển động giải từ phương trình. Chiều dòng điện cảm ứng theo định luật Lenz. Chiều đường sức khép kín.
  - Độ dài mũi tên tỉ lệ với độ lớn thật.
  - Chi tiết nào phóng đại hoặc làm chậm thì **ghi rõ trên hình**, ví dụ "minh hoạ chậm · thực tế hàng chục kHz" hay "Số liệu minh hoạ".
- **Màu đại lượng cố định** trên nền tối: lực `#FF4D6D`, vận tốc `#22C7E8`, gia tốc `#B66DFF`, từ trường `#4ADE80`, dòng điện `#FBBF24`. Cảnh 3D dùng đúng các màu này cho đường sức, mũi tên và dòng điện phát sáng.
- **Phụ đề luôn có**:
  - Chữ có chân, màu trắng, hiện từng cụm, đặt ở y ≈ 1500.
  - Không đặt chữ trong 150 px trên cùng, dưới y 1540, hay cột phải (x > 940, y > 900) vì giao diện TikTok che.
- **Một ý chính mỗi video.** Lời đọc trả lời đúng câu hỏi mở đầu.
- **Không đăng** khi còn "[TÊN KÊNH]", ô "chưa có khung 3D", hoặc phụ đề nói tới vật không có trong hình.
