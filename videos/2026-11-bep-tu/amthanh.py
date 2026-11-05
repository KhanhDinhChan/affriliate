#!/usr/bin/env python3
"""Âm thanh cho video "Bếp từ" (60 s, phong cách điện ảnh): nền nhạc trầm + hiệu ứng khớp mốc trong video.html.
Dùng lại bộ âm cơ bản ở ../2026-11-roi-tu-do/amthanh.py. Chạy: python3 amthanh.py → out/nen.wav"""
import os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '2026-11-roi-tu-do'))
import amthanh as A  # noqa: E402
from amthanh import SR, T, midi, env, noise, filt, mixs, sweep, pop, tick, whoosh, boom, ting, pluck, pad, marimba, rise  # noqa: E402
A.OUT = os.path.join(HERE, 'out'); os.makedirs(A.OUT, exist_ok=True)
rng = np.random.default_rng(5)
D = 60.0

def boil(d, k=1.0):  # nước sôi: tiếng lục bục ngẫu nhiên + nền ồn trầm
    n = int(d * SR); out = filt(noise(d), lo=120, hi=900) * 0.08 * k
    for _ in range(int(d * 26 * k)):
        i = rng.integers(0, max(1, n - 4000)); f = rng.uniform(250, 900); L = rng.integers(600, 2400); t = np.arange(L) / SR
        out[i:i + L] += np.sin(2 * np.pi * f * t * (1 + 3 * t)) * np.exp(-t * 60) * rng.uniform(0.15, 0.4)
    e = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.5 * SR)); return out * e
def whine(d):  # tiếng rì rì của bếp + nhịp sáng của từ trường (minh hoạ 0,5 Hz)
    t = T(d); s = 0.25 * np.sin(2 * np.pi * 2900 * t) + np.sin(2 * np.pi * 100 * t) * 0.6 + np.sin(2 * np.pi * 200 * t) * 0.3
    return s * (0.35 + 0.65 * np.abs(np.sin(np.pi * t))) * np.minimum(1, np.minimum(t, d - t) / 0.5)
def snap(): return mixs(filt(noise(0.05), lo=1500) * env(0.05, 0.0005, 90), np.sin(2 * np.pi * 1800 * T(0.12)) * env(0.12, 0.001, 45) * 0.5, boom()[:int(0.25 * SR)] * 0.4)
def sizzle(d): t = T(d); return filt(noise(d), lo=3000, hi=9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t) ** 2) * np.minimum(1, np.minimum(t, d - t) / 0.6) * 0.35

m = A.Mix(D)
# nền: hợp âm thứ trầm + piano thưa
prog = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]]
for i in range(13): m.add(i * 4.8 - 0.4, pad(prog[i % 4], 5.6), 0.045)
for i in range(40):
    n = [69, 72, 76, 74, 72, 67, 69, 64][i % 8]; m.add(0.8 + i * 1.5, pluck(midi(n), 2.0), 0.05, pan=np.sin(i) * 0.5)
# S1 mở đầu
m.add(0.2, boom(), 0.5); m.add(0.0, boil(5.2), 0.9)
# S2 xuyên thấu
m.add(4.85, whoosh(0.5), 0.45); m.add(6.4, rise(2.2, 200, 900), 0.25); m.add(8.2, ting(1318, 2.0), 0.25)
# S3 từ trường
m.add(10.85, whoosh(0.4), 0.35); m.add(11.0, whine(8.0), 0.12)
# đoạn giải thích 2D
m.add(18.7, whoosh(0.6), 0.45); m.add(19.4, rise(1.8, 300, 650), 0.2)
for t0 in (20.7, 21.3): m.add(t0, tick(), 0.3)
m.add(23.2, ting(1568, 2.0), 0.3)
for k, t0 in enumerate((27.0, 27.1, 27.2, 27.3)): m.add(t0, pop(), 0.35, pan=-0.5 + k * 0.33)
m.add(31.0, sizzle(4.0), 1.0); m.add(31.2, ting(1175, 1.6), 0.25)
m.add(34.2, marimba(midi(76)), 0.3)
# S5 dòng Foucault + nước sôi mạnh
m.add(36.7, whoosh(0.6), 0.45); m.add(37.0, boil(8.0, 1.6), 1.0); m.add(37.0, whine(8.0), 0.06)
# S6 nam châm
m.add(44.85, whoosh(0.4), 0.35); m.add(46.4, whoosh(0.5), 0.2); m.add(47.0, snap(), 0.8)
# tóm tắt + kết
m.add(50.7, whoosh(0.6), 0.45)
for k, n in enumerate((64, 67, 71, 76)): m.add(51.5 + k * 0.9, marimba(midi(n)), 0.3)
m.add(56.7, whoosh(0.6), 0.4); m.add(57.4, ting(1318, 2.2), 0.3)
m.save('nen.wav', D)
