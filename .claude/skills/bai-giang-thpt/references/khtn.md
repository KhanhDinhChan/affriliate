# Chế độ KHTN — công thức rõ, hiện tượng thấy được

## 1. Công thức: sắp chữ chuẩn như sách giáo khoa

Công thức viết bằng **TeX** và được sắp chữ bằng MathJax ngay trên máy (không cần mạng), xuất ra SVG nét căng nên phóng to không vỡ. **Không bao giờ** gõ công thức thành chữ thường, và không chụp công thức từ nơi khác.

```js
{ formula: 'n_{\\mathrm{Na}} = \\dfrac{2{,}3}{23} = 0{,}1\\ \\mathrm{mol}', id: 'b1', in: 'panel', at: [0, 0.4], align: 'left', size: 62 }
```

Trong tệp `.js`, mỗi dấu `\` của TeX phải viết thành `\\`. Nếu quên, JavaScript sẽ "nuốt" mất dấu: `"\;"` biến thành `";"`, `"\t"` thành ký tự tab. Cách an toàn nhất là dùng `String.raw`, viết TeX y như trên giấy:

```js
{ formula: String.raw`y = x^3 - 3x \;\Rightarrow\; y' = 3x^2 - 3`, in: 'panel', at: [0, 0.3], align: 'left' }
```

### Quy ước trình bày (theo SGK Việt Nam)

| Nội dung | Viết | Hiện |
|---|---|---|
| Dấu phẩy thập phân | `2{,}3` | 2,3 (chứ không viết 2.3) |
| Đơn vị viết đứng, cách số một khoảng | `0{,}1\ \mathrm{mol}`, `9{,}8\ \mathrm{m/s^2}` | 0,1 mol |
| Biến in nghiêng, tên chất và chỉ số chữ in đứng | `n_{\mathrm{Na}}`, `v_{\max}` | |
| Phân số lớn trong dòng tính | `\dfrac{a}{b}` | |
| Vectơ | `\vec F`, `\overrightarrow{AB}` | |
| Phương trình hoá học (mhchem) | `\ce{2Na + 2H2O -> 2NaOH + H2 ^}` | mũi tên, chỉ số, khí ↑ tự đúng chuẩn |
| Cân bằng, thuận nghịch | `\ce{N2 + 3H2 <=> 2NH3}` | |
| Ion, điện tích | `\ce{SO4^2-}`, `\ce{Fe^3+}` | |
| Điều kiện phản ứng | `\ce{->[t^\circ][xt]}` | |

### Màu trong công thức — cùng một quy ước với hình vẽ

Cả hai chế độ đều nền trắng, nên các màu này là **tông đậm** để đủ tương phản. Trong hàm mô phỏng, lấy màu từ `Q` (`Q.F`, `Q.v`, `Q.hl`…) và `T` (`T.ink`, `T.muted`) thay vì gõ mã màu, để hình luôn khớp với công thức.

| Lệnh | Dùng cho | Màu | `Q` |
|---|---|---|---|
| `\cF{F}` | lực | đỏ hồng `#E11D48` | `Q.F` |
| `\cV{v}` | vận tốc; trong Hoá dùng cho chất khí hoặc sản phẩm cần theo dõi | xanh lơ `#0891B2` | `Q.v` |
| `\cA{a}` | gia tốc | tím `#7C3AED` | `Q.a` |
| `\cE{E}` | điện trường, năng lượng | vàng đất `#B45309` | `Q.E` |
| `\cB{B}` | từ trường | xanh lá `#15803D` | `Q.B` |
| `\hl{...}` | **đáp số, đại lượng cần tìm, chất cần chú ý** | cam đậm `#C2410C` | `Q.hl` |

Trên nền trắng không dùng màu trắng hay màu quá nhạt cho nét vẽ: thành cốc, bọt khí và các vật sáng màu đều cần viền xám (`#64748B` trở lên).

Mũi tên và nhãn trong mô phỏng phải dùng **đúng màu đã tô** trong công thức. Như vậy học sinh nối được ký hiệu với hình mà không cần nghe giải thích.

### Cách cho công thức "chạy"

| Mục đích | Cách làm |
|---|---|
| Viết ra từng dòng | mỗi bước một `formula`, mỗi beat **một dòng**, hiện kiểu quét từ trái sang phải (mặc định) |
| Biến đổi tại chỗ (rút gọn, thế số, tô màu) | `{ swap: 'id', formula: '...' }`: công thức cũ mờ đi, công thức mới trượt vào đúng chỗ |
| Đưa công thức gốc lên đầu để tính tiếp | `{ move: 'id', at: [0.5, 0.2] }` |
| Khoanh đáp số | `{ highlight: 'id', label: 'đáp số' }` |
| Đồ thị hàm số | `{ plot: 'x*x - 2', x: [-3, 3], y: [-3, 7], in: 'visual' }` (biểu thức JavaScript theo x) |

Quy tắc trình bày:
- Tối đa **4 dòng công thức** cùng lúc trên màn hình. Nhiều hơn thì `fade` dòng cũ, chỉ giữ dòng gốc và dòng kết quả.
- Mỗi dòng mới phải có lời đọc giải thích **vì sao** được bước đó, không chỉ đọc lại công thức.
- Cỡ chữ công thức: khổ ngang tối thiểu 56, khổ dọc tối thiểu 60. Công thức dài hơn vùng thì tự thu nhỏ, nhưng nếu nhỏ quá thì nên tách thành hai dòng.

## 2. Hiện tượng: mô phỏng chạy theo quy luật thật

Hiện tượng được vẽ bằng một hàm trong `scene.js` (`draw: { ten(kit) {...} }`). Hàm nhận:

- `tau`: số giây từ lúc hiện tượng xuất hiện. Chuyển động tính từ biến này, **theo đúng công thức vật lý**: rơi tự do dùng y = ½gt², dao động dùng x = A·cos(ωt + φ).
- `s`: các trạng thái do kịch bản bật dần theo lời đọc, ví dụ `{ set: 'sim', hong: true }`, `{ set: 'sim', label: true }`.
- Công cụ vẽ: `ctx`, `text`, `arrow`, `rr`, `U` (đơn vị tỉ lệ), `T` (màu theme), `Q` (màu đại lượng).

Ngữ pháp hình ảnh:
1. **Hiện tượng trước, giải thích sau.** Cho học sinh nhìn 2–4 giây rồi mới hiện nhãn.
2. **Mỗi nhãn đi kèm một mũi tên**, màu trùng với màu trong công thức (ví dụ "khí H₂" màu cyan, giống \cV{H₂}).
3. **Phóng đại điều cần thấy**: bọt khí to hơn thật, chuyển động chậm lại. Phải nói rõ trong lời đọc ("xem chậm lại").
4. **Không bịa hiện tượng.** Màu dung dịch, trạng thái chất và tỉ lệ phải đúng thực nghiệm. Có thể chèn video thí nghiệm thật bên cạnh mô phỏng.
5. Mô phỏng phải tất định: không dùng `Math.random()` (dùng hàm băm theo chỉ số), để mọi lần render cho ra kết quả giống nhau.

## 3. Gợi ý theo môn

| Môn | Hình đặc trưng | Công thức hay dùng |
|---|---|---|
| Toán | đồ thị (`plot`), hình học vẽ dần (`draw`), bảng biến thiên | `\lim`, `\int`, `\sum`, `\begin{cases}`, `\overrightarrow{}` |
| Vật lý | chuyển động, vectơ lực, sóng, mạch điện | vectơ tô màu theo đại lượng |
| Hoá học | cốc thí nghiệm, mô hình phân tử, cấu hình electron | `\ce{}` cho mọi phương trình, chỉ số, ion |
| Sinh học | sơ đồ tế bào, quá trình (nguyên phân, quang hợp), phả hệ | `\ce{6CO2 + 6H2O ->[as] C6H12O6 + 6O2}`, tỉ lệ kiểu gen |

## 4. Khi cần nhiều hơn

Đồ thị phức tạp, hình học 3D hoặc biến đổi đại số dài: dùng skill **manim_skill / 3brown1blue** (Manim, phong cách 3Blue1Brown). Có thể dựng đoạn Manim riêng rồi ghép vào video bằng ffmpeg, vẫn giữ khung kênh và phụ đề của bộ máy này.
