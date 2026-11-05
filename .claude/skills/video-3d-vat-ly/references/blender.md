# Dựng cảnh 3D bằng Blender (bpy)

## Cài đặt

- Dùng gói `bpy` (Blender làm thư viện Python), không cần cài ứng dụng Blender: `python3 -m venv <scratchpad>/bpyenv && <scratchpad>/bpyenv/bin/pip install bpy`.
  - bpy 5.x đòi Python 3.13. Máy chưa có thì cài `uv` rồi chạy `uv venv -p 3.13`.
  - Venv nên đặt trong scratchpad, không commit vào repo.
- **EEVEE thường không chạy** trên máy chủ không màn hình (thiếu libEGL). Luôn dùng **Cycles chạy CPU**, `B.render_setup` đã đặt sẵn.
- Ở mỗi video, `canh.py` tự tìm `scripts/bpy3d.py` bằng cách đi ngược lên tới thư mục `.claude/skills/video-3d-vat-ly`.

## Khung một file canh.py

```python
import bpy3d as B
from bpy3d import lerp, ease, seg
DUR = {'S1': 5.0, 'S2': 6.0}                 # giây mỗi cú máy, 24 hình/giây
args = B.args('S1'); B.new_scene(); B.render_setup(args)
B.studio_toi(s=0.35)                          # s ≈ cỡ vật chính (m)
...dựng vật thể, vật liệu...
B.camera()
def setup(shot, t):                            # đặt TOÀN BỘ trạng thái cho thời điểm t: không phụ thuộc khung trước
    reset()                                    # nên có: trả mọi hiệu ứng về mặc định rồi mới bật cái cần
    if shot == 'S1': ...; B.aim(cam, target, lens, fstop)
B.render_shot(args, DUR, setup)
```

`setup(shot, t)` phải thuần, tức là chỉ phụ thuộc `t`. Có như vậy mới xuất được một khung bất kì để thử, và chạy lại được từ giữa chừng.

## Thư viện bpy3d (tóm tắt)

| Nhóm | Hàm |
|---|---|
| Số | `lerp`, `clamp`, `ease`, `ease_out`, `seg(t, a, b)`, `hsh(n)` ngẫu nhiên cố định, `vlerp` |
| Phương trình | `integrate(accel(t, x, v), x0, v0, t_end, stop=…)` trả về `[(x, v)]` theo từng khung |
| Vật liệu | `principled(name, màu, metal, rough, **đầu_vào)`, `emissive(name, màu, độ_sáng)`, `ghostable(m)` + `set_ghost(m, f)`, `glow_on(m, màu)` + `set_in(m, 'Emission Strength', x)`, `set_em`, `wood`, `brick`, `M_copper`, `M_steel`, `M_glass`, `M_water` |
| Hình | `cyl`, `tube` (ống rỗng), `box(bevel)`, `sphere`, `torus`, `text3d`, `curve(điểm, smooth, cyclic)`, `spiral` (cuộn dây phẳng), `helix` (ống dây), `empty` |
| Mặt cắt | `cutaway(vật, tâm_hộp, cỡ)` trả về modifier. Bật hay tắt theo cảnh bằng `show_cut(mods, True/False)` |
| Vectơ 3D | `arrow3d(m)` tạo một lần, `place_arrow(e, đầu, cuối)` gọi mỗi khung |
| Ánh sáng | `area(name, vị_trí, hướng_tới, năng_lượng, cỡ, màu)`, `world(màu, cường_độ)`, `studio_toi`, `studio_sang` |
| Máy quay | `camera()`, `aim(vị_trí, điểm_nhìn, lens, fstop)` (fstop lấy nét đúng điểm nhìn), `orbit(tâm, khoảng_cách, góc, cao)` |

## Ánh sáng và màu

- **Phông tối điện ảnh** (`studio_toi`):
  - Ba đèn vùng: chính màu ấm (1, 0,86, 0,7) chiếu chéo từ trước bên trái; viền lạnh (0,7, 0,85, 1) chiếu từ sau bên phải; đèn đỉnh yếu.
  - Đèn xa ngoài vùng nét thành các chấm bokeh. Trời gần đen (0,02).
- **Phông sáng thí nghiệm** (`studio_sang`): phông cong màu be, 3 đèn mềm, trời ấm cường độ 0,25.
- Bảng màu AgX "Punchy" cho màu đậm, không bị bệt. Hai lỗi hay gặp:
  - **Cháy trắng hoặc màu nhạt:** giảm năng lượng đèn hoặc độ sáng vật liệu phát sáng, đừng tăng phơi sáng.
  - **Quá tối:** tăng đèn chính, đừng tăng trời.
- **Vật liệu phát sáng** (đường sức, dòng điện) để độ sáng 2–6. Thêm nhịp sáng tối theo dòng xoay chiều: `0,6 + 6·|sin(2πft)|`.
- **Màu đại lượng trong 3D** phải trùng với lớp phủ 2D:

| Đại lượng | Màu (RGB tuyến tính) |
|---|---|
| Từ trường | (0,25, 1, 0,45) |
| Dòng điện | (1, 0,75, 0,1) |
| Dòng Foucault, nhiệt | (1, 0,45, 0,06) |
| Vận tốc | (0,13, 0,78, 0,91) |
| Lực | (1, 0,1, 0,2) |

## Hiệu ứng đã dùng

| Hiệu ứng | Cách làm | Ví dụ |
|---|---|---|
| Xuyên thấu vỏ máy | `ghostable(vật_liệu_vỏ)`, rồi `set_ghost(m, 0,8·ease(...))` | Bếp từ S2: lộ cuộn dây |
| Mặt cắt | `cutaway([nồi, đáy, nước], tâm, cỡ)`, bật ở cảnh cần | Bếp từ S5, ống đồng cắt dọc |
| Đường sức khép kín | `curve(điểm, smooth=True, cyclic=True)` + vật liệu phát sáng + mũi hình nón chỉ chiều | Bếp từ S3 |
| Vòng dòng điện xoáy | `torus` phát sáng, quay chậm `rotation_euler.z = ±t·0,8` | Bếp từ S5, ống đồng |
| Vật nóng đỏ | `glow_on(m, (1, 0,25, 0,04))`, `set_in(m, 'Emission Strength', 1,6·heat)` | Đáy nồi |
| Bọt khí, hạt | Tạo sẵn 40 quả cầu nhỏ, mỗi khung đặt vị trí theo `hsh(i)` và pha `(t + …) % chu_kì` | Nước sôi |
| Vectơ 3D | `arrow3d` + `place_arrow`, độ dài = hệ số × độ lớn thật | Mẫu con lắc |
| Rơi, dao động | `integrate` với phương trình thật, đọc vị trí theo khung | Nam châm rơi: m·dv/dt = mg − kv |

## Máy quay

- Khổ dọc 9:16: `sensor_fit = 'VERTICAL'`, lens 40–50 mm. Vật chính đặt ở 1/3 giữa khung, chừa trên 300 px cho tiêu đề và nhãn, chừa dưới y 1400 cho phụ đề.
- **Mỗi cú máy chỉ một chuyển động**: trượt vào, xoay quanh (`orbit` ±30°), hạ máy, hoặc chuyển nét. Dùng `ease(t/D)` để đầu và cuối mượt.
- **Chuyển nét:** đổi `target` và `fstop` dần giữa hai vật bằng `lerp(..., q)`, `q = ease((t − a)/(b − a))`.
- Đặt máy **ngoài** mọi vật thể: nhìn vào mặt cắt từ phía bị cắt. Đặt máy trong vật sẽ cho khung đen hoặc méo.

## Thời gian xuất (CPU 4 nhân, 720×1280)

| Cảnh | Mẫu | Giây/khung |
|---|---|---|
| Phông sáng, kim loại, ít trong suốt | 16 | 6–9 |
| Phông tối, nước, kính, xoá phông | 12 | 9–15 |
| Thêm đường sức phát sáng hoặc mặt cắt boolean | 12 | 15–19 |

Ví dụ: video 60 s có 30 s cảnh 3D, tức 720 khung × khoảng 13 s, mất **khoảng 2,5–3 giờ**. Mẹo cắt giờ:

- **Giảm thời gian cảnh 3D:** cảnh tĩnh thì xuất ít khung rồi kéo dài bằng trượt hoặc phóng ảnh trong lớp phủ.
- **Giảm độ phân giải:** 720×1280 là đủ, khi ghép html2mp4 phóng lên 1080×1920. Mẫu 12 + khử nhiễu OIDN đủ sạch.
- **Thông số Cycles:** `max_bounces = 6`, `transmission_bounces = 4`, `adaptive_threshold = 0,03`, tắt caustics (đã đặt sẵn).
- **Thử rẻ trước:** thử ở 360×640, 8 mẫu (khoảng 3 s/khung). Chỉ xuất thật khi mọi cú máy đã đúng.

## Chạy dài

- Lệnh nền trong phiên làm việc bị dừng sau 2 giờ, nên dùng `scripts/chay-nen.sh` (setsid, nohup) để xuất. Script ghi log `frames-<cảnh>.log` và tạo `frames-done.flag` khi xong.
- Muốn được báo khi xong: chạy lệnh nền `until [ -f frames-done.flag ]; do sleep 120; done`.
- Phải xuất lại một cảnh sau khi sửa: xoá `frames/<cảnh>` rồi chạy lại cảnh đó. Các khung đã có của cảnh khác được giữ nguyên.
- Thêm `frames/`, `frames-*.log`, `frames-done*.flag`, `out/*.wav`, `out/*.png` vào `.gitignore` của video. Chỉ commit mã và MP4 thành phẩm.

## Soát lỗi trước khi xuất thật

- [ ] Khung đầu, giữa, cuối của **mỗi** cú máy đều đã xem.
- [ ] Vật mà phụ đề nhắc tới có trong khung suốt thời gian câu đó hiện.
- [ ] Không có vật lơ lửng sai chỗ, kiểm tra toạ độ khi lật hay dời vật. Không có mặt cắt hở ở cảnh không cần.
- [ ] Chiều đường sức, dòng điện, mũi tên đúng vật lí. Nhịp phát sáng khớp với đồ thị ở đoạn 2D.
- [ ] Không cháy sáng, không quá tối. Nhãn 2D đặt sau không đè lên vật chính.
