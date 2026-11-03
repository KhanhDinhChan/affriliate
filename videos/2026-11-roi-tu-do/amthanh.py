#!/usr/bin/env python3
"""Tạo nhạc nền + hiệu ứng âm thanh cho 4 video Rơi tự do, bằng code (numpy), khớp mốc thời gian trong từng file HTML.
Chạy: python3 amthanh.py  → out/v1.wav … out/v4.wav (48 kHz, stereo). Kết quả giống hệt nhau mỗi lần chạy (hạt giống cố định).
Video chưa có giọng đọc: khi thu giọng, trộn giọng ở mức chính và để file này làm nền (html2mp4.js --audio giong.mp3 --music out/vN.wav --music-volume 1)."""
import numpy as np, wave, os

SR = 48000
rng = np.random.default_rng(7)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

def T(d): return np.arange(int(d * SR)) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env(d, a=0.005, dec=5.0): t = T(d); return np.minimum(t / a, 1) * np.exp(-t * dec)
def noise(d): return rng.standard_normal(int(d * SR))
def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m = m / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m = m / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def mixs(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def sweep(f0, f1, d): t = T(d); f = f0 * (f1 / f0) ** (t / d); return np.sin(2 * np.pi * np.cumsum(f) / SR)

class Mix:
    def __init__(self, dur): self.b = np.zeros((2, int(dur * SR) + SR))
    def add(self, t0, sig, gain=1.0, pan=0.0):
        i = int(t0 * SR)
        if i < 0: sig = sig[-i:]; i = 0
        n = min(len(sig), self.b.shape[1] - i)
        if n <= 0: return
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
        self.b[0, i:i + n] += sig[:n] * gain * l; self.b[1, i:i + n] += sig[:n] * gain * r
    def save(self, name, dur):
        x = self.b[:, :int(dur * SR)]
        fade = int(0.6 * SR); x[:, -fade:] *= np.linspace(1, 0, fade)
        x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.3) * 0.89
        pcm = (x.T * 32767).astype('<i2')
        with wave.open(os.path.join(OUT, name), 'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
        print('âm thanh:', name, f'{dur:.1f}s')

# ---------- Âm cơ bản ----------
def pop(): return sweep(1000, 300, 0.09) * env(0.09, 0.001, 35)
def bigpop(): return mixs(sweep(620, 150, 0.2) * env(0.2, 0.001, 18), filt(noise(0.02), lo=3000) * env(0.02, 0.0005, 200) * 0.4)
def tick(): return filt(noise(0.025), lo=2500) * env(0.025, 0.0005, 260) + np.sin(2 * np.pi * 3200 * T(0.025)) * env(0.025, 0.0005, 200) * 0.3
def wood(f=900): t = T(0.25); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 38) + 0.4 * np.sin(2 * np.pi * f * 2.7 * t) * np.exp(-t * 60))
def whoosh(d=0.5):
    t = T(d); return filt(noise(d), lo=300, hi=3500) * np.sin(np.pi * t / d) ** 2 * 0.5
def thud(): return mixs(sweep(110, 45, 0.45) * env(0.45, 0.002, 9), filt(noise(0.15), hi=400) * env(0.15, 0.001, 30) * 0.6)
def boom(): return mixs(sweep(90, 32, 1.0) * env(1.0, 0.002, 4), filt(noise(0.4), hi=300) * env(0.4, 0.001, 9) * 0.7)
def ting(f=1568, d=1.6):
    t = T(d); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 10)) * np.minimum(t / 0.002, 1)
def pluck(f, d=1.4):
    t = T(d); s = sum(np.sin(2 * np.pi * k * f * t) / k * np.exp(-t * (2 + 1.6 * k)) for k in range(1, 7)); return s * np.minimum(t / 0.003, 1)
def marimba(f, d=1.0): t = T(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 22)
def scratch(d, bright=2500, rate=9.0):
    t = T(d); am = 0.55 + 0.45 * np.sin(2 * np.pi * rate * t + rng.uniform(0, 6)); gate = (np.sin(2 * np.pi * 2.3 * t + rng.uniform(0, 6)) > -0.6).astype(float)
    g = np.convolve(gate, np.ones(400) / 400, 'same'); edge = np.minimum(1, np.minimum(t, d - t) / 0.03)
    return filt(noise(d), lo=bright, hi=9000) * am * g * edge * 0.35
def whistle_down(d, f0=1400, f1=350):
    t = T(d); s = sweep(f0, f1, d) * (1 + 0.0 * t); return s * np.minimum(1, np.minimum(t, d - t) / 0.08) * 0.35
def rise(d, f0=300, f1=900): t = T(d); return sweep(f0, f1, d) * np.minimum(1, np.minimum(t, d - t) / 0.05) * 0.3
def buzzer():
    out = []
    for f in (220, 175):
        t = T(0.2); out.append(filt(np.sign(np.sin(2 * np.pi * f * t)), hi=1800) * np.minimum(1, (0.2 - t) / 0.02) * 0.35)
    return np.concatenate(out)
def pad(chord, d):
    t = T(d); s = sum(np.sin(2 * np.pi * midi(n) * t) + np.sin(2 * np.pi * midi(n) * 1.004 * t) for n in chord)
    return filt(s, hi=2200) * np.minimum(1, np.minimum(t, d - t) / 0.8)
def kick(): return sweep(150, 45, 0.25) * env(0.25, 0.001, 12)
def hat(): return filt(noise(0.05), lo=7000) * env(0.05, 0.0005, 70)
def clap(): return filt(noise(0.14), lo=900, hi=3500) * env(0.14, 0.001, 25)
def bass(f, d=0.4): t = T(d); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 4) * np.minimum(t / 0.005, 1)

# ---------- V1 · Ghi chép vẽ tay (19 s) ----------
def v1():
    D = 19; m = Mix(D)
    chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]
    beat = 60 / 96
    for i in range(int(D / beat)):
        c = chords[(i // 4) % 4]; n = c[[0, 2, 1, 3][i % 4]] + 12
        m.add(i * beat, pluck(midi(n)), 0.10, pan=-0.3 + 0.2 * (i % 4))
        if i % 4 == 0: m.add(i * beat, pluck(midi(c[0] - 12), 1.8), 0.10)
    for a, b in [(0.3, 1.3), (1.3, 2.3), (2.4, 2.9), (2.7, 3.2), (3.2, 3.9), (4.9, 5.4), (7.8, 8.5), (8.6, 9.3), (10.9, 11.6), (12.8, 13.8), (14.6, 15.4), (15.4, 16.1)]:
        m.add(a, scratch(b - a), 0.55, pan=0.3)
    for a, b in [(1.0, 2.6), (2.3, 3.0), (7.9, 9.2), (11.5, 12.1), (13.6, 14.6)]:
        m.add(a, scratch(b - a, bright=1200, rate=5), 0.35, pan=-0.2)
    for t0 in (7.35, 12.35, 16.6): m.add(t0, whoosh(0.5), 0.6)
    m.add(4.8, thud(), 0.9); m.add(10.8, thud(), 0.7); m.add(10.9, ting(1568), 0.35); m.add(11.0, ting(2093), 0.25)
    m.add(14.1, pop(), 0.5, -0.3); m.add(14.2, pop(), 0.5, 0.3); m.add(17.1, ting(1318), 0.35)
    m.save('v1.wav', D)

# ---------- V2 · Nền đen công nghệ (20 s) ----------
def v2():
    D = 20; m = Mix(D)
    prog = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 64], [43, 50, 55, 59, 62], [40, 47, 52, 55, 59]]
    for i, c in enumerate(prog): m.add(i * 5 - 0.4, pad(c, 6.2), 0.05)
    for i in range(14): m.add(0.7 + i * 1.37, ting(midi(84 + [0, 3, 7, 10, 12][i % 5]), 2.5), 0.05, pan=np.sin(i) * 0.7)
    for t0 in (0.6, 4.5): m.add(t0, ting(1046, 2.2), 0.3)
    m.add(11.0, ting(1318, 2.4), 0.35); m.add(11.05, ting(1975, 2.0), 0.2)
    for t0 in (4.2, 8.6, 12.6, 17.3): m.add(t0 - 0.25, whoosh(0.7), 0.45)
    m.add(10.9, boom(), 0.9)
    m.add(13.1, rise(0.8, 220, 660), 0.5); m.add(13.5, rise(0.8, 220, 330), 0.5)
    for k in range(11): m.add(15.3 + k * 0.08, tick(), 0.35)
    m.add(17.8, ting(1568), 0.3)
    m.save('v2.wav', D)

# ---------- V3 · Sơ đồ quy trình (22 s) ----------
def v3():
    D = 22; m = Mix(D)
    for i, c in enumerate([[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59], [48, 55, 64]]): m.add(i * 4.4 - 0.3, pad(c, 5.0), 0.035)
    t0 = 0.5
    while t0 < 17.0: m.add(t0, tick(), 0.22, pan=0.4 if int(t0 * 2) % 2 else -0.4); t0 += 0.5
    notes = [72, 76, 79, 84]
    for i, s in enumerate([3.5, 6.5, 10.0, 13.5]):
        m.add(s - 0.05, whoosh(0.35), 0.4); m.add(s + 0.2, pop(), 0.5); m.add(s + 0.25, marimba(midi(notes[i])), 0.35)
        for k in range(10): m.add(s + 0.3 + k * 0.1, tick(), 0.12)
    m.add(13.8, whistle_down(3.0, 1500, 300), 0.35); m.add(16.8, thud(), 0.8)
    m.add(17.0, boom()[:int(0.5 * SR)], 0.6); m.add(17.05, ting(1568), 0.35)
    m.add(17.8, buzzer(), 0.5); m.add(19.6, whoosh(0.5), 0.5); m.add(20.1, ting(1318), 0.3)
    m.save('v3.wav', D)

# ---------- V4 · Chữ gameshow (20 s) ----------
def v4():
    D = 20; m = Mix(D); beat = 0.5
    bl = [45, 45, 48, 50, 41, 41, 43, 43]
    for i in range(int(D / beat)):
        t0 = i * beat
        if 8.3 <= t0 < 11.6: continue  # im nhạc khi xem chậm cho hồi hộp
        m.add(t0, kick(), 0.35); m.add(t0 + 0.25, hat(), 0.18, 0.3); m.add(t0, hat(), 0.12, -0.3)
        if i % 2 == 1: m.add(t0, clap(), 0.22)
        m.add(t0, bass(midi(bl[(i // 2) % 8])), 0.22)
    for t0 in (0.25, 0.5): m.add(t0, bigpop(), 0.7)
    for t0 in (2.35, 2.6, 2.75, 2.9, 3.05, 3.4, 3.8, 4.1, 4.4, 6.6, 8.4, 11.75, 14.0, 14.4, 14.6): m.add(t0, pop(), 0.45, pan=rng.uniform(-0.5, 0.5))
    for t0 in (4.9, 5.5, 6.1): m.add(t0, wood(880), 0.6)
    m.add(6.7, wood(1320), 0.6); m.add(7.0, rise(0.3, 500, 1400), 0.4); m.add(7.2, rise(0.4, 300, 700), 0.4)
    m.add(8.3, whoosh(0.4), 0.5); m.add(8.9, whistle_down(2.0, 1600, 300), 0.4); m.add(10.9, boom(), 1.0)
    for k, n in enumerate([72, 76, 79, 84]): m.add(11.6 + k * 0.09, marimba(midi(n)), 0.4)
    m.add(11.95, ting(2093), 0.3); m.add(17.6, whoosh(0.5), 0.5); m.add(18.1, ting(1318), 0.3)
    m.save('v4.wav', D)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); v1(); v2(); v3(); v4()
