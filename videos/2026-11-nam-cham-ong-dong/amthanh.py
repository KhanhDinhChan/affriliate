#!/usr/bin/env python3
"""Âm thanh cho video "Thả nam châm vào ống đồng" (39 s): nhạc nền nhẹ + hiệu ứng khớp mốc trong video.html.
Dùng lại bộ âm cơ bản ở ../2026-11-roi-tu-do/amthanh.py. Chạy: python3 amthanh.py → out/nen.wav"""
import os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '2026-11-roi-tu-do'))
import amthanh as A  # noqa: E402
from amthanh import SR, T, midi, env, noise, filt, mixs, sweep, pop, tick, whoosh, thud, ting, pluck, scratch, pad, marimba, rise  # noqa: E402
A.OUT = os.path.join(HERE, 'out'); os.makedirs(A.OUT, exist_ok=True)
D = 39.0

# thời điểm chạm đệm: cùng mô phỏng với blender/canh.py
def land(braking, G=9.8, VT=0.2, PZ0=0.25, PZ1=1.25, MH=0.08, PAD=0.03, Z0=1.36, TD=2.0, dt=1e-4):
    z, v, t = Z0, 0.0, TD
    while z - MH / 2 > PAD:
        lo, hi = max(z - MH / 2, PZ0), min(z + MH / 2, PZ1); ins = max(0.0, hi - lo) / MH
        v += (G - ((G / VT) * v * ins if braking else 0)) * dt; z -= v * dt; t += dt
    return t
T_OBJ, T_MAG = land(False), land(True)

def clank():  # tiếng kim loại chạm đệm cao su: vài tần số không hoà âm, tắt nhanh
    t = T(1.0); s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(523, 1, 9), (1347, 0.6, 14), (2210, 0.4, 20), (3480, 0.25, 28)])
    return mixs(s * np.minimum(t / 0.001, 1), thud() * 0.5)
def hum(d): t = T(d); return (np.sin(2 * np.pi * 110 * t) + 0.4 * np.sin(2 * np.pi * 220 * t) + 0.2 * np.sin(2 * np.pi * 330 * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t)) * np.minimum(1, np.minimum(t, d - t) / 0.3)
def slide(): return whoosh(0.5)

m = A.Mix(D)
for i, c in enumerate([[48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 60], [43, 50, 59, 62], [48, 55, 64, 67], [45, 52, 60, 64], [41, 48, 57, 60], [43, 50, 59, 62]]):
    m.add(i * 5 - 0.3, pad(c, 5.8), 0.03)
beat = 60 / 84
for i in range(int(D / beat)):
    c = [60, 64, 67, 71, 69, 67, 64, 62][i % 8]
    m.add(i * beat, pluck(midi(c + 12), 1.0), 0.045, pan=-0.3 + 0.6 * ((i * 3) % 5) / 4)
def pen(a, b): m.add(a, scratch(b - a), 0.4, pan=0.2)

# --- thí nghiệm 3D ---
pen(0.4, 1.0); pen(0.8, 1.7)
m.add(1.95, whoosh(0.3), 0.35)
m.add(T_OBJ, clank(), 0.7, pan=0.35); m.add(T_OBJ + 0.08, ting(1568), 0.3, 0.35)
m.add(2.1, hum(T_MAG - 2.15), 0.06, pan=-0.3)
m.add(T_MAG, thud(), 0.7, pan=-0.35); m.add(T_MAG + 0.08, ting(1318), 0.3, -0.35)
# --- giải thích 2D ---
m.add(8.95, slide(), 0.5); pen(9.2, 9.8); m.add(10.3, pop(), 0.45); pen(9.8, 10.6)
m.add(12.25, pop(), 0.4); m.add(12.6, rise(1.6, 300, 600), 0.25); m.add(13.5, pop(), 0.4)
for t0 in (15.25, 15.3, 16.25, 16.3): m.add(t0, pop(), 0.35, pan=-0.4 if t0 % 0.1 < 0.06 else 0.4)
pen(15.5, 16.2); pen(16.5, 17.2); pen(17.2, 18.2); m.add(17.6, tick(), 0.4)
pen(19.2, 19.8); pen(19.6, 20.2); m.add(19.4, rise(1.0, 400, 700), 0.3)
for k in range(8): m.add(20.0 + k * 0.2, tick(), 0.15)
m.add(22.0, slide(), 0.4); m.add(22.3, rise(2.0, 250, 500), 0.2); pen(23.0, 23.8); pen(23.6, 24.4)
m.add(24.8, whoosh(1.0), 0.35); m.add(25.65, ting(1760), 0.3); for_ = [m.add(25.8 + k * 0.12, tick(), 0.15) for k in range(8)]; pen(26.0, 26.8)
# --- cận cảnh 3D ---
m.add(27.6, slide(), 0.45); m.add(28.0, hum(4.0), 0.07); pen(28.4, 29.2)
for k, n in enumerate([76, 79, 83]): m.add(28.6 + k * 0.15, marimba(midi(n)), 0.18)
# --- ứng dụng + kết ---
m.add(31.95, slide(), 0.45); pen(32.4, 33.4); pen(33.2, 34.2); m.add(33.0, pop(), 0.4); pen(34.0, 35.0)
m.add(36.0, slide(), 0.45); m.add(36.4, pop(), 0.5); m.add(36.6, ting(1318), 0.3); pen(36.8, 37.8)
m.save('nen.wav', D)
print(f'vật thường chạm đệm sau {T_OBJ - 2:.2f} s, nam châm sau {T_MAG - 2:.2f} s')
