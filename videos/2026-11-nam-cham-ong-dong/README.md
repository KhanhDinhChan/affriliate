# Vật lí 12: Thả nam châm vào ống đồng (cảm ứng điện từ, dòng điện Foucault)

Video khổ dọc 9:16, dài 39 giây. Thành phẩm: `out/nam-cham-ong-dong.mp4`.

| Thời gian | Đoạn | Làm bằng |
|---|---|---|
| 0–9 s | **Thí nghiệm 3D**: nam châm và khối kim loại không có từ tính thả cùng lúc vào hai ống đồng cắt dọc. Khối kim loại chạm đệm sau khoảng 0,5 s, nam châm sau khoảng 5 s | Blender (Cycles), `blender/canh.py --shot A` |
| 9–28 s | **Giải thích bằng đại lượng vật lí (2D)**: mặt cắt ống, mũi tên P, v, B, F từ; dòng điện cảm ứng ⊙ ⊗ ở trên và dưới nam châm; định luật Lenz; công thức P − F_từ = ma, F_từ = kv; đồ thị v(t) so sánh với rơi tự do, phóng to để thấy tốc độ giới hạn v_T | canvas 2D + TeX (MathJax) |
| 28–32 s | **Cận cảnh 3D**: nam châm rơi đều, các vòng dòng điện Foucault phát sáng chạy theo | Blender, `blender/canh.py --shot B` |
| 32–36 s | Ứng dụng: phanh điện từ (lá kim loại chạy qua giữa hai nam châm, lực từ ngược chiều v) | canvas 2D |
| 36–39 s | Thẻ kết | canvas 2D |

## Vật lí trong video

- **Chuyển động trong Blender tính từ phương trình:** m·dv/dt = mg − k·v. Lực hãm điện từ tỉ lệ với v và chỉ có khi nam châm nằm trong ống.
- **Số liệu minh hoạ:** v_T = 0,2 m/s, ống dài 1 m. Video có ghi chú "Số liệu minh hoạ" trên đồ thị.
- **Chiều dòng điện cảm ứng** (cực N quay xuống):
  - Phía dưới nam châm: từ thông tăng, dòng điện ngược chiều kim đồng hồ khi nhìn từ trên. Trên mặt cắt là trái ⊙, phải ⊗. Dòng này đẩy nam châm lên.
  - Phía trên nam châm: từ thông giảm, dòng điện cùng chiều kim đồng hồ. Trên mặt cắt là trái ⊗, phải ⊙. Dòng này hút nam châm lên.
- **Màu đại lượng:** lực đỏ hồng, vận tốc cyan, gia tốc tím, từ trường xanh lá, dòng điện cảm ứng cam.

## Dựng lại

Cần Python có gói `bpy` (Blender 5.x, `pip install bpy`), Node + Playwright, `ffmpeg`. Máy không có card đồ hoạ thì dùng Cycles chạy CPU, khoảng 8 giây mỗi khung ở 720×1280.

Bước 1: xuất cảnh rộng, 216 khung.

```bash
cd blender && python canh.py --shot A --samples 16 --out ../frames/A
```

Bước 2: xuất cảnh cận, 97 khung.

```bash
cd blender && python canh.py --shot B --samples 16 --out ../frames/B
```

Bước 3: sắp chữ công thức.

```bash
node tex.js
```

Bước 4: tạo âm thanh.

```bash
python3 amthanh.py
```

Bước 5: ghép video.

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js video.html out/nam-cham-ong-dong.mp4 --audio out/nen.wav
```

Thêm giọng đọc: `--audio giong.mp3 --music out/nen.wav --music-volume 0.5`, rồi chỉnh mốc thời gian trong `CAPS` của `video.html` cho khớp. Muốn đổi tên kênh thì sửa hằng `CHANNEL`.
