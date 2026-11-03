#!/usr/bin/env python3
"""Âm thanh cho video "Lịch sử của máy tính" (giấy cắt dán, 51 s): nhạc lo-fi + tiếng giấy + hiệu ứng từng thời kỳ.
Dùng lại bộ âm cơ bản trong ../2026-11-roi-tu-do/amthanh.py. Chạy: python3 amthanh.py → out/nen.wav"""
import os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '2026-11-roi-tu-do'))
import amthanh as A  # noqa: E402
from amthanh import SR, T, midi, env, noise, filt, mixs, sweep, pop, tick, wood, whoosh, thud, ting, pluck, scratch, kick, hat, bass, marimba  # noqa: E402

A.OUT = os.path.join(HERE, 'out')
rng = np.random.default_rng(11)
# Mốc thời gian khớp SCENES trong lich-su-may-tinh.html: mở đầu 4 s, mỗi thời kỳ có PHOTO giây ảnh thật trước hình vẽ
PHOTO = 1.5
DURS = [6, 6, 6, 7, 6, 6, 6, 6, 6]
SC = [4.0 + sum(DURS[:i]) for i in range(len(DURS))]
END = [t + d for t, d in zip(SC, DURS)]
OUT0 = END[-1]; CTA0 = OUT0 + 2.8; D = CTA0 + 2.7

def rustle(d=0.4):
    n = noise(d); crack = (rng.random(len(n)) > 0.985).astype(float); crack = np.convolve(crack, np.ones(240) / 40, 'same')
    t = T(d); return filt(n, lo=900, hi=7000) * (0.35 + crack) * np.sin(np.pi * t / d) ** 1.5 * 0.5
def slap(): return mixs(filt(noise(0.14), lo=200, hi=3500) * env(0.14, 0.001, 32), sweep(190, 85, 0.14) * env(0.14, 0.001, 22) * 0.7)
def blip(f): t = T(0.09); return np.sin(2 * np.pi * f * t) * env(0.09, 0.002, 30)
def hum(d): t = T(d); return (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t) + 0.25 * np.sin(2 * np.pi * 180 * t)) * np.minimum(1, np.minimum(t, d - t) / 0.3)
def zap(): return mixs(sweep(2400, 300, 0.25) * env(0.25, 0.001, 10) * 0.6, filt(noise(0.2), lo=2000) * env(0.2, 0.001, 18) * 0.4)

m = A.Mix(D)
# --- nhạc lo-fi 90 BPM: pluck + kick/hat nhẹ + bass ---
beat = 60 / 90; chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
for i in range(int(D / beat)):
    t0 = i * beat; c = chords[(i // 4) % 4]
    m.add(t0, pluck(midi(c[[0, 2, 3, 1][i % 4]] + 12), 1.2), 0.07, pan=-0.25 + 0.15 * (i % 4))
    if i % 2 == 0: m.add(t0, kick(), 0.16)
    m.add(t0 + beat / 2, hat(), 0.06, 0.3)
    if i % 4 == 0: m.add(t0, bass(midi(c[0] - 12), 1.2), 0.16)

def pen(a, b): m.add(a, scratch(b - a), 0.45, pan=0.25)

# --- Mở đầu ---
for t0 in (0.2, 0.35, 0.5, 0.65): m.add(t0, rustle(0.25), 0.7, pan=rng.uniform(-0.6, 0.6))
m.add(0.3, slap(), 0.8); m.add(0.6, slap(), 0.9); pen(1.1, 2.2)

# --- 9 thời kỳ: thẻ rơi, số năm đập xuống, nhãn in, ảnh thật rơi rồi thu nhỏ, ghi chú viết tay ---
NOTES = [[(1.6, 2.6)], [(1.8, 2.8)], [(1.6, 2.6), (2.4, 3.2)], [(1.4, 2.0), (2.9, 3.8)], [(1.8, 2.8)], [(2.0, 3.0)], [(1.6, 2.3)], [(1.8, 2.8)], [(1.6, 2.3), (2.2, 2.9), (3.0, 3.7)]]
for i, (t0, t1) in enumerate(zip(SC, END)):
    m.add(t0, rustle(0.45), 0.8, pan=-0.2)
    m.add(t0 + 0.3, slap(), 0.9)
    for k in range(7): m.add(t0 + 0.7 + k * 0.06, tick(), 0.25, 0.1)
    m.add(t0 + 0.6, rustle(0.3), 0.6, 0.3); m.add(t0 + 0.85, slap(), 0.5)          # ảnh thật rơi xuống
    m.add(t0 + PHOTO - 0.05, whoosh(0.4), 0.35)                                     # ảnh thu nhỏ
    for a, b in NOTES[i]: pen(t0 + PHOTO + a, t0 + PHOTO + b)
    m.add(t1 - 0.05, whoosh(0.4), 0.5)
S = [t + PHOTO for t in SC]  # mốc bắt đầu phần hình vẽ của từng thời kỳ
for r, cnt in enumerate([2, 0, 4, 1, 3, 0, 2]):
    if cnt: m.add(S[0] + 1.25 + r * 0.28, wood(1100 + r * 40), 0.5, pan=-0.6 + r * 0.2)
for k in range(24): m.add(S[1] + 0.9 + k * 0.096, wood(1500), 0.18, pan=0.2)
for k in range(8): m.add(S[2] + 0.6 + k * 0.5, wood(320), 0.35)
for k in range(3): m.add(S[2] + 0.8 + k * 0.2, rustle(0.25), 0.5, -0.5)
for k in range(5): m.add(S[3] + 0.75 + k * 0.12, thud(), 0.45, pan=-0.5 + k * 0.25)
m.add(S[3] + 0.5, hum(5.0), 0.06)
for k in range(18): m.add(S[3] + 1.0 + k * 0.24, blip(800 + 800 * rng.random()), 0.12, pan=rng.uniform(-0.7, 0.7))
m.add(S[4] + 1.0, zap(), 0.5); m.add(S[4] + 1.3, pop(), 0.6)
m.add(S[5] + 1.0, whoosh(0.6), 0.4); m.add(S[5] + 2.0, ting(1975), 0.25)
m.add(S[6] + 0.6, blip(880), 0.4)
for k in range(13): m.add(S[6] + 0.9 + k * 0.123, tick(), 0.4, pan=rng.uniform(-0.3, 0.3))
for k in range(10): m.add(S[7] + 0.8 + k * 0.13, blip(midi(72 + [0, 4, 7, 12][k % 4] + 12 * (k // 8))), 0.28)
for k in range(20): m.add(S[8] + 0.8 + k * 0.07, pop(), 0.22, pan=-0.4 + (k % 4) * 0.27)
# --- Kết ---
m.add(OUT0, rustle(0.45), 0.8); m.add(OUT0 + 0.3, slap(), 0.9); m.add(OUT0 + 1.4, thud(), 0.9); m.add(OUT0 + 1.42, slap(), 0.6)
m.add(CTA0, whoosh(0.4), 0.5); m.add(CTA0, rustle(0.45), 0.8); m.add(CTA0 + 0.6, slap(), 0.9); m.add(CTA0 + 0.7, ting(1318), 0.3)
pen(CTA0 + 1.1, CTA0 + 1.9)
for k, n in enumerate([72, 76, 79, 84]): m.add(CTA0 + 0.1 + k * 0.1, marimba(midi(n)), 0.25)
m.save('nen.wav', D)
