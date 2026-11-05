#!/usr/bin/env python3
"""am.py: bộ âm thanh tổng hợp bằng numpy (không cần tải file âm thanh, không vướng bản quyền).
Dùng trong amthanh.py của từng video:
    import am as A; A.OUT = '<thu-muc-video>/out'
    m = A.Mix(60.0); m.add(0.2, A.boom(), 0.5); m.add(5.0, A.whoosh(0.5), 0.4, pan=-0.3); m.save('nen.wav', 60.0)
Kết quả giống hệt nhau mỗi lần chạy (hạt giống cố định). 48 kHz, stereo."""
import numpy as np, wave, os

SR = 48000
rng = np.random.default_rng(7)
OUT = os.path.join(os.getcwd(), 'out')
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

# ---------- Âm cơ bản: chuyển cảnh, nhấn, nhạc cụ ----------
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


# ---------- Âm hiện tượng (video 3D) ----------
def boil(d, k=1.0, seed=5):
    """Nước sôi: tiếng lục bục ngẫu nhiên trên nền ồn trầm. k: độ sôi (1,6 = sôi mạnh)."""
    r = np.random.default_rng(seed); n = int(d * SR); out = filt(noise(d), lo=120, hi=900) * 0.08 * k
    for _ in range(int(d * 26 * k)):
        i = r.integers(0, max(1, n - 4000)); f = r.uniform(250, 900); L = r.integers(600, 2400); t = np.arange(L) / SR
        out[i:i + L] += np.sin(2 * np.pi * f * t * (1 + 3 * t)) * np.exp(-t * 60) * r.uniform(0.15, 0.4)
    e = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.5 * SR)); return out * e
def whine(d, f=2900, pulse=0.5):
    """Tiếng rì rì của thiết bị điện (bếp từ, máy biến áp) + nhịp sáng tối theo dòng xoay chiều minh hoạ chậm."""
    t = T(d); s = 0.25 * np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * 100 * t) * 0.6 + np.sin(2 * np.pi * 200 * t) * 0.3
    return s * (0.35 + 0.65 * np.abs(np.sin(2 * np.pi * pulse * t))) * np.minimum(1, np.minimum(t, d - t) / 0.5)
def hum(d, f=110):
    """Tiếng ù trầm (nam châm rơi, từ trường mạnh)."""
    t = T(d); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t)) * np.minimum(1, np.minimum(t, d - t) / 0.3)
def snap():
    """Nam châm hút dính vào kim loại."""
    return mixs(filt(noise(0.05), lo=1500) * env(0.05, 0.0005, 90), np.sin(2 * np.pi * 1800 * T(0.12)) * env(0.12, 0.001, 45) * 0.5, boom()[:int(0.25 * SR)] * 0.4)
def clank():
    """Kim loại chạm vật cứng: vài tần số không hoà âm, tắt nhanh."""
    t = T(1.0); s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(523, 1, 9), (1347, 0.6, 14), (2210, 0.4, 20), (3480, 0.25, 28)])
    return mixs(s * np.minimum(t / 0.001, 1), thud() * 0.5)
def sizzle(d):
    """Xèo xèo (toả nhiệt, đốt nóng)."""
    t = T(d); return filt(noise(d), lo=3000, hi=9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t) ** 2) * np.minimum(1, np.minimum(t, d - t) / 0.6) * 0.35
def spark(d=0.3):
    """Tia lửa điện, phóng điện."""
    t = T(d); g = (rng.random(len(t)) < 0.02).astype(float); g = np.convolve(g, np.ones(200) / 20, 'same')
    return filt(noise(d), lo=2000) * g * np.exp(-t * 6) * 0.6
def bed(d, prog=None, every=4.8, gain_pad=1.0, notes=(69, 72, 76, 74, 72, 67, 69, 64), step=1.5):
    """Nền nhạc điện ảnh trầm: hợp âm thứ kéo dài + piano thưa. Trả về Mix để thêm hiệu ứng."""
    prog = prog or [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]]
    m = Mix(d)
    for i in range(int(d / every) + 2): m.add(i * every - 0.4, pad(prog[i % len(prog)], every + 0.8), 0.045 * gain_pad)
    for i in range(int(d / step)): m.add(0.8 + i * step, pluck(midi(notes[i % len(notes)]), 2.0), 0.05, pan=np.sin(i) * 0.5)
    return m
