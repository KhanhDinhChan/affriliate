# Hệ phong cách đồ hoạ

Mục tiêu: lướt qua 1 giây là nhận ra video của trung tâm, dù video thuộc tuyến nào. Bí quyết là **3 lớp vỏ (look) khác nhau, nhưng dùng chung một bộ gen**.

## Bộ gen dùng chung (định nghĩa trong `templates/lib.js` → `BRAND`)

| Thành phần | Giá trị | Ghi chú |
|---|---|---|
| Màu chủ đạo | **Xanh lượng tử** `#2F6BFF` | logo, nhãn series, thanh tiến độ |
| Màu nhấn | **Cam năng lượng** `#FF8A1F` | CTA, đáp án đúng, con số quan trọng nhất. Chỉ dùng **một chỗ** trên mỗi khung hình |
| Mực / Giấy | `#0E1A2B` / `#F5F7FB` | chữ và nền của phong cách sáng |
| Font chính | **Be Vietnam Pro** (OFL, miễn phí) | do người Việt thiết kế, dấu tiếng Việt đẹp. Dùng đậm 800 cho tiêu đề, 700 cho phụ đề |
| Font viết tay | **Pangolin** (OFL) | chỉ dùng cho phong cách bảng phấn |
| Hoạ tiết | đường sóng hình sin | xuất hiện ở nền phong cách sáng và trên bao bì, ấn phẩm |
| Logo góc trên | viên tròn cam + "VẬT LÝ [TÊN]" | xuất hiện suốt video, ở trên cùng của vùng an toàn |
| Nhãn series | hộp màu dưới logo | mỗi tuyến một tên cố định: HIỂU BẢN CHẤT · GIẢI NHANH · TRÊN LỚP · HÀNH TRÌNH · TUYỂN SINH |
| Thẻ kết | cùng một bố cục ở mọi video | xem `endCard()` |

### Bảng màu đại lượng vật lý — "tài sản" lớn nhất của trung tâm

Mỗi đại lượng có một màu cố định trên **mọi** video, bài giảng và tài liệu phát tay. Sau vài tuần, học sinh chỉ cần nhìn màu là biết đại lượng nào. Đây vừa là nhận diện thương hiệu, vừa là phương pháp sư phạm: người học ghi nhớ khái niệm qua màu, đúng với nguyên tắc "tín hiệu" (signaling) của Mayer.

| Đại lượng | Màu | Mã |
|---|---|---|
| Lực **F** | đỏ hồng | `#FF4D6D` |
| Vận tốc **v** | xanh cyan | `#22C7E8` |
| Gia tốc **a** | tím | `#B66DFF` |
| Điện trường **E**, năng lượng | vàng | `#FFC83D` |
| Từ trường **B** | xanh lá | `#3DDC84` |
| Quỹ đạo, độ dời, đường phụ | xám xanh | `#9FB3C8` |

Nên in bảng này lên bảng lớp, vở mẫu và slide để toàn bộ trung tâm dùng chung.

## Ba lớp vỏ

| | ① Phòng thí nghiệm | ② Bảng phấn | ③ Sáng & tin cậy |
|---|---|---|---|
| Dùng cho | Hiểu bản chất, Sai lầm kinh điển | Giải nhanh, Bẫy đề | Hành trình học viên, Tuyển sinh |
| Nền | xanh đêm `#0B1422`, kẻ lưới như bản vẽ kỹ thuật | bảng xanh `#1F3A33` có vệt lau phấn | giấy sáng `#F5F7FB` và đường sóng |
| Chữ | Be Vietnam Pro trắng | Pangolin màu phấn | Be Vietnam Pro màu mực |
| Chuyển động | mô phỏng theo công thức thật, chấm hoạt nghiệm, vectơ | chữ hiện dần như đang viết, khoanh tròn, gạch chân lượn sóng, đồng hồ đếm ngược | chữ nảy vào (kinetic type), thẻ trượt vào, cột biểu đồ mọc lên kèm số đếm |
| Cảm giác | "khoa học, thông minh" | "thầy giảng sát bên" | "chuyên nghiệp, minh bạch" |
| Template | `templates/lab.html` | `templates/board.html` | `templates/promo.html` |

Video quay thật (tuyến ③) không cần lớp vỏ riêng. Chỉ phủ thêm logo, nhãn series, phụ đề và thẻ kết, cộng vectơ vẽ đè theo bảng màu đại lượng.

## Quy tắc bố cục khổ dọc 1080×1920

- **Vùng an toàn**: giao diện TikTok/Reels che khoảng **150 px trên cùng**, **khoảng 20% phía dưới** (từ y ≈ 1540: tên kênh, mô tả) và **cột nút bên phải** (từ y ≈ 900 trở xuống). Các giá trị này nằm trong `SAFE` ở `lib.js`. Không đặt chữ quan trọng vào các vùng đó.
- **Phụ đề**: đặt quanh 76% chiều cao, cỡ 50 px đậm, tối đa 2 dòng, nền tối bo góc.
- **Cỡ chữ tối thiểu**: tiêu đề ≥ 72 px; nhãn hoặc công thức ≥ 48 px; ghi chú phụ ≥ 36 px. Luôn kiểm tra ảnh thu nhỏ còn 360 px chiều rộng, như khi xem trên điện thoại.
- **Một khung hình, một ý**: mỗi cảnh dài 1,5–5 giây. Chữ phải đứng yên đủ thời gian để đọc, tính bằng số chữ ÷ 9 + 0,5 giây.
- **Chuyển động**: phần tử vào cảnh trong 0,2–0,5 giây, dùng easing chậm vào chậm ra (`easeOut`, `backOut`). Không để phần tử chuyển động đều. Không nháy sáng quá 3 lần trong 1 giây.
- **Tương phản**: chữ trên nền phải đạt tỉ lệ tương phản ≥ 4,5:1 (theo WCAG). Màu cam nhấn đặt trên nền sáng chỉ dùng cho chữ cỡ lớn (≥ 48 px đậm).
- **Thanh tiến độ** mảnh ở đáy video giúp người xem biết video sắp hết, nhờ đó họ ở lại xem đến cuối.

## Âm thanh

- **Giọng đọc**: chọn một giọng duy nhất cho cả kênh. Tốt nhất là giọng thật của giáo viên. Nếu dùng TTS thì chọn edge-tts `vi-VN-NamMinhNeural` hoặc `HoaiMyNeural`, FPT.AI hay Vbee (xem `../triet-tu-chu-han/references/giong-doc.md`).
- **Nhạc nền**: chọn nhạc không lời có nhịp nhẹ, âm lượng 8–15% so với giọng. Dùng nhạc có giấy phép miễn phí, hoặc nhạc trong thư viện thương mại của TikTok.
- **Hiệu ứng âm thanh** (tuỳ chọn): tiếng "tách" khi khoanh đáp án, tiếng "ting" khi hiện công thức. Giữ hiệu ứng nhỏ và nhất quán giữa các video.

## Đổi sang thương hiệu thật

1. Sửa `BRAND` trong `templates/lib.js`: tên trung tâm, tên kênh, số Zalo, câu CTA, và màu nếu trung tâm đã có logo riêng.
2. Nếu đổi màu chủ đạo hoặc màu nhấn, **giữ nguyên bảng màu đại lượng**, chỉ cần tránh màu nhấn trùng với màu lực F.
3. Render lại cả 3 template, đặt cạnh nhau và kiểm tra xem chúng có còn trông như "cùng một nhà" không.
