# Đoạn giải thích 2D và lớp phủ

Lớp phủ là một trang HTML canvas 1080×1920: `window.SIZE`, `window.DURATION`, `window.renderAt(t)` (có thể là hàm async). Trang này chiếu khung 3D và vẽ mọi thứ 2D lên trên. Bộ ghép `html2mp4.js` đợi `window.ready` (font, công thức) rồi chụp từng khung.

## Cấu trúc video.html

```html
<script> window.SIZE = [1080, 1920]; window.DURATION = 60;
  const SHOTS = [{ id: 'S1', t0: 0, t1: 5, n: 121 }, ...];  // n = DUR×24+1
  const CAPS = [[0.3, 2.6, 'câu phụ đề'], ...]; </script>
<script src="overlay.js"></script>
<script>
  window.ready = Promise.all([loadFonts(), loadTex(['faraday', 'joule'])]);
  function explain(t) { const u = t - 19; ... }              // u: giây tính từ đầu đoạn 2D
  window.renderAt = async (t) => {
    clearFrame(); const sh = await draw3D(t);
    if (sh) { tag(...); } else if (t >= 19 && t < 37) explain(t); else if (t >= 57) endCard(t, 57, CHANNEL, slogan, next);
    dips(t, [19, 37, 51, 57]); film(t); watermark(HANDLE); if (t < 57) subtitle(t);
  };
</script>
```

## Thư viện overlay.js

| Hàm | Việc |
|---|---|
| `clearFrame()`, `film(t)`, `dips(t, [mốc])` | Xoá nền; hạt phim + tối viền; chuyển cảnh qua màu đen |
| `draw3D(t)` | Chiếu khung `frames/<id>/NNNN.jpg`, mờ chồng 0,35 s giữa hai cảnh 3D liền nhau. Thiếu khung thì hiện ô xám |
| `subtitle(t, y=1500)` | Phụ đề chữ có chân, hiện từng cụm 3–5 chữ |
| `tag(chữ, x, y, p, màu)` | Nhãn phim tài liệu: nền đen mờ, vạch màu bên trái |
| `txt(chữ, x, y, {size, w, font, color, align, alpha, glow, shadow, max, ls})` | Chữ. `max` tự thu nhỏ cho vừa bề rộng |
| `vec(x1, y1, x2, y2, màu, p, nhãn, {side, off, w})` | Vectơ phát sáng mọc dần, nhãn đặt cạnh đầu mũi tên |
| `sym(x, y, chấm?, màu)` | ⊙ (đi ra) hoặc ⊗ (đi vào) |
| `axes(x0, y0, w, h, {xl, yl, xmin, xmax, ymin, ymax, p})` + `plot(ax, f, xa, xEnd, màu, {dash, dot})` | Hệ trục và đồ thị chạy dần, có chấm đầu đường |
| `formula(tên, x, y, cao, p)` | Công thức SVG từ `tex/` |
| `glowLine(fn, màu)`, `arrowHead(x, y, góc, màu)` | Nét tự do phát sáng (đường sức cong, sóng) |
| `steam(t, a)`, `note(chữ)`, `chain(hàng, t, t0)`, `endCard(...)`, `watermark(handle)` | Hơi nước; ghi chú trung thực; chuỗi tóm tắt; thẻ kết; tên kênh mờ |
| `seg`, `fade(t, a, b)`, `easeOut`, `easeInOut`, `lerp`, `clamp`, `hash` | Nhịp thời gian |

## Màu đại lượng (nền tối)

| Đại lượng | Mã | Hằng |
|---|---|---|
| Lực F, P, T | `#FF4D6D` | `Q.F` |
| Vận tốc v | `#22C7E8` | `Q.v` |
| Gia tốc a, li độ trên đồ thị | `#B66DFF` | `Q.a` |
| Từ trường B, từ thông Φ | `#4ADE80` | `Q.B` |
| Dòng điện i, I; điện trường E | `#FBBF24` | `Q.i`, `Q.E` |
| Dòng cảm ứng, dòng Foucault | `#FB923C` | `Q.I` |
| Nhiệt, toả nhiệt | `#F43F5E` | `Q.heat` |
| Đường đối chứng (nét đứt) | `#9CA3AF` | `Q.s` |

- **Mỗi khung chỉ một điểm nhấn cam** `ACCENT`: đáp số hoặc hợp lực.
- Trong công thức TeX, tô màu bằng tên tạm `\color{qv}{v}`, rồi khai báo `C: { qv: '#22C7E8' }` trong `cong-thuc.js`.

## Cách dựng đoạn 2D (12–20 giây)

1. **Tiêu đề câu hỏi** ở y ≈ 270, ví dụ "VÌ SAO ĐÁY NỒI NÓNG?".
2. **Hình đơn giản hoá** ở vùng y 380–1250: mặt cắt hoặc sơ đồ vẽ nét, màu xám trung tính. Nhãn bộ phận cỡ chữ 26, mờ 75 %.
3. **Thêm từng lớp đại lượng**, mỗi lớp 2–4 giây và đi cùng câu phụ đề nói về nó:
   - vectơ lực, vận tốc (độ dài tỉ lệ với độ lớn thật, tính từ cùng công thức với 3D);
   - đường sức, kí hiệu ⊙ ⊗ cho chiều dòng điện;
   - **đồ thị** theo thời gian, chạy đồng bộ với hình: cùng biến `u`, cùng tần số minh hoạ.
4. **Công thức SGK** hiện khi phụ đề gọi tên định luật, cao 64–140 px. Hai công thức nối nhau thì cho công thức trước mờ đi rồi mới hiện công thức sau, cùng vị trí.
5. **Ghi chú trung thực** (`note`) khi làm chậm, phóng đại, hoặc số liệu chỉ để minh hoạ.

## Bố cục và vùng an toàn (khổ 1080×1920)

| Vùng | Dùng cho |
|---|---|
| y < 150 | Không đặt gì (thanh trạng thái, tên tài khoản) |
| y 200–330 | Tiêu đề, nhãn `tag` (x từ 120) |
| y 380–1300 | Hình chính, đồ thị |
| y 1300–1420 | Công thức, ghi chú |
| y ≈ 1500 | Phụ đề |
| y > 1540, hoặc x > 940 và y > 900 | Không đặt chữ (mô tả, nút TikTok che) |

Duyệt bằng ảnh tĩnh ở các mốc đổi lớp: `--stills 20,23,27,31,35`. Ghép các ảnh thành một tấm bằng `ffmpeg ... hstack` để xem một lượt. Soi các lỗi:

- chữ đè nhau, chữ tràn mép;
- nhãn tối trên nền tối;
- mũi tên chỉ sai chiều;
- đồ thị lệch nhịp với hình.
