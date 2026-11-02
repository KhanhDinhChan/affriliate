# Tuyến nội dung video cho trung tâm Vật Lý

## Ai xem, ai trả tiền

| Đối tượng | Họ cần gì | Kênh chính | Điều thuyết phục họ |
|---|---|---|---|
| **Học sinh lớp 10–12** (người học) | hiểu nhanh, điểm cao, nội dung không nhàm | TikTok, YouTube Shorts, Reels | "thầy/cô này giảng dễ hiểu", mẹo làm bài, video giải trí mà vẫn học được |
| **Phụ huynh** (người trả tiền) | con tiến bộ thật, lớp nghiêm túc, an tâm | Facebook, nhóm Zalo, Reels | kết quả cụ thể, lớp học thật, giáo viên tận tâm, minh bạch học phí và lịch học |

Vì vậy cần **hai nhóm video**: nhóm "kéo học sinh" (tuyến 1–2) và nhóm "thuyết phục phụ huynh" (tuyến 3–5). Học sinh xem rồi giới thiệu cho bố mẹ, phụ huynh xem rồi quyết định đăng ký.

## Phễu 5 tuyến

```
THU HÚT     ① Hiểu bản chất ── (chuyên mục: Sai lầm kinh điển)        → lượt xem, theo dõi
TIN TƯỞNG   ② Giải nhanh 30 giây      ③ Trên lớp hôm nay              → tin vào chuyên môn
QUYẾT ĐỊNH  ④ Hành trình học viên     ⑤ Tuyển sinh & sự kiện          → nhắn tin, học thử
```

Tỉ lệ gợi ý trong một tháng: **① 35% · ② 30% · ③ 15% · ④ 10% · ⑤ 10%**. Kênh mới nên dồn vào ① và ② để có người xem trước, khi nào đã có lượng theo dõi ổn định mới tăng ④ và ⑤.

---

### ① HIỂU BẢN CHẤT — "Vật lý trong 15–45 giây"

- **Mục tiêu**: lan truyền, xây hình ảnh "ở đây học là hiểu, không học vẹt".
- **Công thức**: câu hỏi đời thường → mô phỏng → "à, hoá ra là vậy" → một công thức → mẹo làm bài → thẻ kết.
- **Phong cách**: *Phòng thí nghiệm* (`templates/lab.html`). Mô phỏng chạy bằng công thức thật, vectơ tô theo bảng màu đại lượng.
- **Tần suất**: 2 video/tuần.
- **Kho đề tài** (bám chương trình GDPT 2018):
  - Lớp 10: hai viên bi ném ngang và thả rơi; vì sao xe phanh gấp thì người lao về trước (quán tính); vì sao bánh xe có rãnh (ma sát); thang máy đi lên thì cân chỉ bao nhiêu; vì sao xe đua nghiêng khi vào cua.
  - Lớp 11: con lắc đồng hồ; vì sao cầu có thể sập khi lính bước đều (cộng hưởng); sóng dừng trên dây đàn; vì sao chim đậu trên dây điện mà không bị giật; tụ điện trong đèn flash.
  - Lớp 12: vì sao nồi áp suất nấu nhanh (khí lý tưởng); bếp từ, sạc không dây (cảm ứng điện từ); vì sao nam châm hút được sắt; phóng xạ và "chu kỳ bán rã" qua hình ảnh hộp bi.
- **Chuyên mục con: SAI LẦM KINH ĐIỂN** (Đúng hay Sai?). Màn hình chia đôi ĐÚNG/SAI, để người xem bình luận đáp án trước khi xem lời giải. Đây là dạng kéo bình luận mạnh nhất.
  - "Vật nặng rơi nhanh hơn vật nhẹ?" · "Phải có lực thì vật mới chuyển động?" · "Mùa hè nóng vì Trái Đất ở gần Mặt Trời?" · "Dòng điện bị bóng đèn 'ăn' bớt?" · "Áo đen hấp thụ nhiệt nên mặc mùa hè mát hơn?"

### ② GIẢI NHANH 30 GIÂY — "Bẫy đề"

- **Mục tiêu**: chứng minh năng lực luyện thi. Học sinh lưu video lại, phụ huynh thấy được chuyên môn.
- **Công thức**: "Câu này 90% học sinh dính bẫy" → đề bài → khoanh dữ kiện, gạch bẫy → 2–3 dòng lời giải → khoanh đáp án → ô ghi nhớ → thẻ kết. Có đồng hồ đếm ngược tạo kịch tính.
- **Phong cách**: *Bảng phấn* (`templates/board.html`).
- **Tần suất**: 2 video/tuần. **Tháng 3–6 tăng lên 4 video/tuần.**
- **Theo cấu trúc đề tốt nghiệp mới** (3 phần): trắc nghiệm nhiều lựa chọn, **đúng/sai** (4 ý), **trả lời ngắn**. Mỗi dạng nên làm thành một series riêng, ví dụ "Đúng/Sai không sai" hay "Trả lời ngắn 20 giây".
- **Nguyên tắc**: chỉ dùng đề do trung tâm tự soạn, đề minh hoạ hoặc đề chính thức của Bộ, có ghi nguồn. Không chép lời giải của kênh khác.
- **Đặc biệt — Chữa đề ngay tối thi**: tối hôm thi tốt nghiệp, chữa nhanh 5–10 câu khó của đề thật. Đây là thời điểm có lượng xem cao nhất trong năm.

### ③ TRÊN LỚP HÔM NAY — "Hậu trường"

- **Mục tiêu**: cho thấy lớp học là thật: thầy cô thật, thí nghiệm thật, không khí lớp học. Phụ huynh tin vào những gì họ nhìn thấy tận mắt.
- **Công thức**: một khoảnh khắc 20–40 giây, như thí nghiệm "cháy" nhất buổi, câu hỏi hay của học sinh, hay lúc cả lớp "à" lên. Bổ sung phụ đề, vectơ và nhãn vẽ đè lên video.
- **Phong cách**: video quay thật, cộng lớp đồ hoạ chung của trung tâm (logo, phụ đề, vectơ theo bảng màu đại lượng).
- **Tần suất**: 1 video/tuần.
- **Bắt buộc**: phải có **đồng ý bằng văn bản của phụ huynh** trước khi quay học sinh (vì học sinh là trẻ vị thành niên). Nếu chưa có đồng ý thì chỉ quay tay, bàn thí nghiệm, bảng, hoặc cảnh từ phía sau.

### ④ HÀNH TRÌNH HỌC VIÊN — "Từ 5 lên 8"

- **Mục tiêu**: cho phụ huynh thấy bằng chứng tiến bộ.
- **Công thức**: điểm đầu khoá → vấn đề gặp phải → cách trung tâm giúp → điểm hiện tại → lời học sinh hoặc phụ huynh nói (thu âm hoặc quay thật).
- **Phong cách**: *Sáng & tin cậy* (`templates/promo.html`): biểu đồ, chữ động, thẻ thông tin.
- **Tần suất**: 2 video/tháng, và nhiều hơn khi vừa có kết quả thi.
- **Nguyên tắc vàng**: **chỉ dùng số liệu thật, có đồng ý của phụ huynh**. Không bịa lời nhận xét, không dùng ảnh mạng. Template có nhãn "SỐ LIỆU MẪU", chỉ tắt nhãn này khi đã thay bằng số thật. Không so sánh hay chê trách học sinh khác.

### ⑤ TUYỂN SINH & SỰ KIỆN

- **Mục tiêu**: thúc đẩy học thử, nhắn tin, đăng ký.
- **Các dạng**: khai giảng; lịch học, học phí minh bạch; "1 buổi học thử diễn ra thế nào"; livestream giải đề; mini game "đoán hiện tượng" có quà.
- **Phong cách**: *Sáng & tin cậy*.
- **Tần suất**: theo mùa (xem lịch bên dưới), ngoài mùa khoảng 2 video/tháng.

---

## Lịch đăng mẫu một tuần (5 video ngắn + 1 bài Facebook)

| Thứ | Video | Tuyến | Kênh |
|---|---|---|---|
| T2 | Vì sao…? (mô phỏng) | ① | TikTok, Shorts, Reels |
| T3 | Bẫy đề 30 giây | ② | TikTok, Shorts, Reels, nhóm Zalo |
| T4 | Đúng hay Sai? | ① chuyên mục con | TikTok, Reels |
| T5 | Bẫy đề 30 giây (dạng Đúng/Sai hoặc Trả lời ngắn) | ② | TikTok, Shorts, Reels |
| T6 | Trên lớp hôm nay | ③ | Facebook, Reels, TikTok |
| CN | Hành trình học viên hoặc Tuyển sinh | ④ / ⑤ | Facebook, nhóm Zalo phụ huynh |

Khung giờ đăng: học sinh xem nhiều vào khoảng **11h30–13h** và **20h–22h30**, phụ huynh xem nhiều vào **20h–22h**. Hãy xem số liệu (Analytics) của kênh sau 4 tuần để chỉnh lại khung giờ cho chính xác.

## Lịch theo mùa trong năm học

| Tháng | Học sinh đang làm gì | Ưu tiên |
|---|---|---|
| 6–7 | thi tốt nghiệp xong, có điểm | Chữa đề ngay tối thi (②) · kết quả học viên (④) · tuyển sinh lớp mới (⑤) |
| 8–9 | khai giảng | ⑤ khai giảng và học thử · ① mở đầu chương mới |
| 10–11 | học chương mới | ① hiểu bản chất · ③ thí nghiệm trên lớp |
| 12–1 | thi học kỳ I | ② giải nhanh theo chương · ④ tiến bộ giữa kỳ |
| 2–3 | ôn tổng hợp | ② chữa đề tham khảo hoặc đề minh hoạ của Bộ (series dài, làm ngay khi Bộ công bố) · ⑤ lớp luyện đề |
| 4–5 | nước rút, thi học kỳ II | ② 4 video/tuần · livestream giải đề · ① chống học vẹt |

## Mở đầu 3 giây (hook) — chọn 1 trong 6 công thức

1. **Câu đố**: "Bi nào chạm đất trước?"
2. **Con số gây sốc**: "90% học sinh sai câu này."
3. **Phản trực giác**: "Vật nặng KHÔNG rơi nhanh hơn."
4. **Kết quả trước**: "Từ 5,8 lên 8,2 trong một học kỳ — đây là cách."
5. **Đếm ngược**: "Giải câu này trong 10 giây."
6. **Gọi tên nỗi đau**: "Con học Lý rất chăm mà vẫn mất điểm?" (dành cho phụ huynh)

Chữ hook phải xuất hiện **ngay khung hình đầu tiên**, vì khung đầu cũng là ảnh bìa (thumbnail) trên lưới video của TikTok.

## Kêu gọi hành động (CTA) — thống nhất cho mọi video

- Thẻ kết dài 2–3 giây, luôn cùng một bố cục: tên trung tâm → khẩu hiệu → nút "Học thử miễn phí 1 buổi" → số Zalo → tên kênh.
- Ở phần mô tả video, ghi một dòng duy nhất: *"Nhắn 'HỌC THỬ' để nhận lịch lớp gần nhất"*.
- Tuyến ① và ② nên thêm câu hỏi để kéo bình luận, ví dụ "Bạn chọn đáp án nào? Bình luận trước khi xem lời giải!".
