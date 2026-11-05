#!/usr/bin/env python3
"""MẪU âm thanh cho video 3D (24 s): nền nhạc trầm + hiệu ứng khớp đúng mốc trong video.html.
Chạy: python3 amthanh.py → out/nen.wav. Ghép: html2mp4.js video.html out/<ten>.mp4 --audio out/nen.wav"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
_d = HERE
while _d != '/' and not os.path.isdir(os.path.join(_d, '.claude/skills/video-3d-vat-ly/scripts')): _d = os.path.dirname(_d)
sys.path.insert(0, os.path.join(_d, '.claude/skills/video-3d-vat-ly/scripts'))
import am as A  # noqa: E402
A.OUT = os.path.join(HERE, 'out'); os.makedirs(A.OUT, exist_ok=True)
D = 24.0

m = A.bed(D)
# mở đầu 3D
m.add(0.2, A.boom(), 0.5)
# vào đoạn 2D (mốc dips trong video.html)
m.add(3.7, A.whoosh(0.6), 0.45)
for t0 in (4.8, 5.6): m.add(t0, A.pop(), 0.35)        # mũi tên P, T mọc
m.add(7.6, A.pop(), 0.4, pan=-0.3)                     # hợp lực
m.add(8.6, A.ting(1568, 1.6), 0.25)                    # công thức li độ
m.add(10.6, A.pop(), 0.35, pan=0.3)                    # vectơ v
m.add(11.8, A.marimba(A.midi(76)), 0.3)                # công thức chu kì
# cận cảnh 3D
m.add(15.7, A.whoosh(0.6), 0.45); m.add(16.6, A.rise(1.5, 300, 700), 0.2)
# thẻ kết
m.add(19.7, A.whoosh(0.6), 0.4); m.add(20.4, A.ting(1318, 2.2), 0.3)
m.save('nen.wav', D)
