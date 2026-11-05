# [Lớp] · [Tên hiện tượng]

Video khổ dọc 9:16, dài [..] giây. Thành phẩm: `out/[ten].mp4`.

| Thời gian | Đoạn | Làm bằng |
|---|---|---|
| 0–4 s | Toàn cảnh 3D | Blender, `blender/canh.py --shot S1` |
| 4–16 s | **Giải thích 2D**: lực P, T, vectơ v, đồ thị α(t), công thức chu kì | canvas 2D (`overlay.js`) + TeX |
| 16–20 s | Cận cảnh 3D, mũi tên vận tốc 3D | Blender, `--shot S2` |
| 20–24 s | Thẻ kết | canvas 2D |

## Vật lí trong video

- Phương trình chuyển động, số liệu, chỗ nào là minh hoạ (làm chậm, phóng đại).

## Dựng lại

Bước 1: xuất các cảnh 3D (chạy nền, khoảng [..] phút).

```bash
BPY_PYTHON=<python có bpy> bash ../../.claude/skills/video-3d-vat-ly/scripts/chay-nen.sh . "S1 S2"
```

Bước 2: sắp chữ công thức.

```bash
node ../../.claude/skills/video-3d-vat-ly/scripts/tex.js cong-thuc.js
```

Bước 3: tạo âm thanh.

```bash
python3 amthanh.py
```

Bước 4: ghép video.

```bash
node ../../.claude/skills/video-vat-ly/scripts/html2mp4.js video.html out/v.mp4 --audio out/nen.wav
```

Bước 5: chuẩn hoá âm lượng.

```bash
ffmpeg -i out/v.mp4 -c:v copy -af loudnorm=I=-15:TP=-1.5 out/[ten].mp4
```
