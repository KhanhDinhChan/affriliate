# Bếp từ: vì sao nồi nóng mà mặt bếp không nóng?

Video 3D kiểu **điện ảnh** (skill `video-3d-vat-ly`), khổ dọc 1080×1920, 60 giây, 30 hình/giây. Thành phẩm: `out/bep-tu.mp4`.

## Phân đoạn

| Giây | Đoạn | Hình |
|---|---|---|
| 0–5 | S1 · Móc câu 3D | Máy lướt sát mặt kính: nồi nước sôi, chuyển nét sang viên đá bên cạnh chưa tan |
| 5–11 | S2 · Xuyên thấu | Mặt kính, thân bếp mờ dần, lộ cuộn dây đồng phẳng và thanh ferit |
| 11–19 | S3 · Từ trường | Cuộn dây sáng theo dòng xoay chiều, đường sức xuyên qua kính vào đáy nồi (minh hoạ chậm) |
| 19–37 | **Giải thích 2D** | Mặt cắt bếp, nồi; đường sức B; đồ thị i(t) và B(t); dòng Foucault ⊙ ⊗; công thức Faraday và Joule |
| 37–45 | S5 · Kiểm chứng | Nồi cắt dọc: vòng dòng xoáy trong đáy, đáy nóng đỏ dần, bọt khí |
| 45–51 | S6 · Thử tại nhà | Nam châm hút dính vào đáy nồi |
| 51–57 | Tóm tắt | Chuỗi: dòng xoay chiều → từ trường biến thiên → dòng Foucault → toả nhiệt |
| 57–60 | Thẻ kết | Tên kênh, bài sau |

## Vật lí trong video

- Cuộn dây mang dòng xoay chiều tần số hàng chục kHz, tạo từ trường biến thiên.
- Từ thông qua đáy nồi biến thiên, nên có suất điện động cảm ứng: e_c = −ΔΦ/Δt (định luật Faraday).
- Đáy nồi là kim loại, nên sinh dòng điện Foucault. Dòng này toả nhiệt theo Q = I²Rt.
- Mặt kính gốm không dẫn điện, nên không có dòng điện và không tự nóng lên. Kính chỉ ấm lên vì tiếp xúc với nồi nóng.
- Nồi phải bằng vật liệu sắt từ thì mới dùng được (thử bằng nam châm).

**Phần minh hoạ:** nhịp sáng của cuộn dây và đường sức được làm chậm ("minh hoạ chậm · thực tế hàng chục kHz"). Số liệu trên đồ thị chỉ để minh hoạ.

## Dựng lại

```bash
# 1. Cảnh 3D (khoảng 3 giờ trên CPU 4 nhân)
BPY_PYTHON=<python có bpy> bash ../../.claude/skills/video-3d-vat-ly/scripts/chay-nen.sh . "S1 S2 S3 S5 S6"
# 2. Công thức và âm thanh
node tex.js && python3 amthanh.py
# 3. Ghép và chuẩn hoá âm lượng
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js video.html out/v.mp4 --audio out/nen.wav
ffmpeg -i out/v.mp4 -c:v copy -af loudnorm=I=-15:TP=-1.5 -ar 48000 out/bep-tu.mp4
```

Trước khi đăng: thay `[TÊN KÊNH]` và `@tenkenh` trong `video.html`.
