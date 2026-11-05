"""MẪU cảnh 3D: con lắc đơn dao động (phong cách điện ảnh, nền tối). Chép cả thư mục mau/ sang videos/<ngay>-<chu-de>/ rồi sửa.
Hai cú máy, minh hoạ đủ các kĩ thuật của skill:
  S1 (4 s)  toàn cảnh, máy trượt chậm vào, xoá phông nhẹ
  S2 (4 s)  cận quả nặng, mũi tên 3D vận tốc (xanh cyan) đổi độ dài và chiều theo đúng v(t), quỹ đạo phát sáng
Chuyển động tính từ phương trình: θ'' = −(g/L)·sin θ (giải số bằng B.integrate), không ước lượng bằng mắt.
Chạy:  python canh.py --shot S1                 (ghi ../frames/S1/0000.jpg…)
       python canh.py --shot S2 --frames 48     (thử một khung)"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
_d = HERE
while _d != '/' and not os.path.isdir(os.path.join(_d, '.claude/skills/video-3d-vat-ly/scripts')): _d = os.path.dirname(_d)
sys.path.insert(0, os.path.join(_d, '.claude/skills/video-3d-vat-ly/scripts'))
import bpy3d as B  # noqa: E402
from bpy3d import lerp, ease, seg  # noqa: E402

DUR = {'S1': 4.0, 'S2': 4.0}
args = B.args('S1'); B.new_scene(); B.render_setup(args)

# ---------- vật lí ----------
G, L, TH0 = 9.8, 0.45, math.radians(28)          # chiều dài dây 45 cm, biên độ góc 28°
PIVOT = (0.0, 0.0, 0.62)
SIM = B.integrate(lambda t, th, w: -(G / L) * math.sin(th), TH0, 0.0, max(DUR.values()))   # [(θ, ω)] mỗi khung
def state(t):
    th, w = SIM[min(len(SIM) - 1, int(round(t * B.FPS)))]
    bob = (PIVOT[0] + L * math.sin(th), PIVOT[1], PIVOT[2] - L * math.cos(th))
    vel = (L * w * math.cos(th), 0.0, L * w * math.sin(th))                   # v = ω·L, tiếp tuyến quỹ đạo
    return th, bob, vel

# ---------- dựng cảnh ----------
B.studio_toi(center=(0, 0, 0), s=0.5)
M_METAL = B.principled('gia_kim_loai', (0.05, 0.05, 0.055), 0.8, 0.35)
M_BRASS = B.principled('dong_thau', (0.85, 0.62, 0.32), 1.0, 0.18)
M_STRING = B.principled('day', (0.85, 0.85, 0.82), 0.0, 0.6)
M_V = B.emissive('vec_v', (0.13, 0.78, 0.91), 6.0)                     # vận tốc: cyan (bảng màu đại lượng)
M_PATH = B.emissive('quy_dao', (1.0, 0.75, 0.35), 1.2)
B.box((0.36, 0.2, 0.025), (0, 0.05, 0.0125), M_METAL, bevel=0.004)     # đế
B.cyl(0.008, 0.66, (-0.14, 0.05, 0.33), M_METAL)                       # trụ
B.box((0.18, 0.012, 0.012), (-0.06, 0.02, PIVOT[2] + 0.006), M_METAL, bevel=0.002)   # thanh ngang
STRING = B.cyl(0.0012, 1.0, (0, 0, 0), M_STRING, verts=12)
BOB = B.sphere(0.032, (0, 0, 0), M_BRASS)
ARROW_V = B.arrow3d(M_V, radius=0.0035, head=0.02)
PATH = B.curve([(PIVOT[0] + L * math.sin(a), PIVOT[1] - 0.001, PIVOT[2] - L * math.cos(a)) for a in [lerp(-TH0, TH0, i / 60) for i in range(61)]], M_PATH, bevel=0.0012)
B.camera()

def setup(shot, t):
    th, bob, vel = state(t); k = ease(t / DUR[shot])
    BOB.location = bob
    mid = ((PIVOT[0] + bob[0]) / 2, PIVOT[1], (PIVOT[2] + bob[2]) / 2)
    STRING.location = mid; STRING.rotation_euler = (0, -th, 0); STRING.scale = (1, 1, L)
    if shot == 'S1':
        PATH.hide_render = True; B.place_arrow(ARROW_V, bob, bob, show=False)
        B.aim((lerp(0.55, 0.40, k), lerp(-1.35, -1.05, k), lerp(0.42, 0.36, k)), (0, 0, 0.36), 40, 4.0)
    elif shot == 'S2':
        PATH.hide_render = False; B.set_em(M_PATH, 1.2 * seg(t, 0.2, 0.8))
        sc = 0.12                                                          # 1 m/s vẽ dài 12 cm
        B.place_arrow(ARROW_V, bob, tuple(b + sc * v for b, v in zip(bob, vel)), show=t > 0.5)
        B.aim((lerp(0.30, 0.22, k), -0.55, PIVOT[2] - L + 0.08), (0, 0, PIVOT[2] - L + 0.03), 50, 2.8)

B.render_shot(args, DUR, setup)
