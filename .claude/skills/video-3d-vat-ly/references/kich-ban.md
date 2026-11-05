# Kịch bản video 3D giải thích hiện tượng

## Hai kiểu video

Chọn **một kiểu** cho mỗi video, không trộn.

| | **Điện ảnh** (mặc định) | **Thí nghiệm** |
|---|---|---|
| Hợp với | Thiết bị, hiện tượng đời thường: bếp từ, sạc không dây, lò vi sóng, máy biến áp, cầu vồng | Thí nghiệm so sánh, định luật: nam châm rơi trong ống đồng, con lắc, va chạm |
| Phông | `B.studio_toi`: bàn gỗ, tường tối, đèn xa nhoè bokeh | `B.studio_sang`: phông cong màu be, ánh sáng mềm |
| Máy quay | Lướt chậm, xoá phông (f/2,8–5,6), lấy nét chuyển từ vật này sang vật khác | Đứng yên hoặc trượt rất nhẹ, nét toàn cảnh, thấy rõ cả hai thí nghiệm |
| Hiệu ứng | Xuyên thấu vỏ máy, mặt cắt, đường sức phát sáng, hạt phim | Ống cắt dọc, vòng dòng điện phát sáng, số đo |
| Lớp phủ 2D | Nền tối, nét phát sáng (scripts/overlay.js) | Nền tối như kiểu điện ảnh, hoặc nền giấy kiểu Sổ tay (xem `videos/2026-11-nam-cham-ong-dong/video.html`) |
| Độ dài | 50–60 s | 35–45 s |

## Khung điện ảnh 60 giây (theo video Bếp từ)

| Giây | Đoạn | Nội dung | Ghi chú |
|---|---|---|---|
| 0–5 | **Móc câu 3D** | Hiện tượng gây tò mò, chưa giải thích. Tiêu đề lớn hiện 1,5 s | Câu hỏi phải nhìn thấy được trong hình, ví dụ nồi sôi mà viên đá cạnh đó chưa tan |
| 5–11 | **Xuyên vào trong 3D** | Vỏ, mặt kính mờ dần để lộ bộ phận chính. Nhãn gọi tên | `B.set_ghost` 0 → 0,8 trong 2 s |
| 11–19 | **Cơ chế 3D** | Đường sức, dòng điện phát sáng, nhịp theo dòng xoay chiều | Ghi "minh hoạ chậm" nếu tần số thật quá nhanh |
| 19–37 | **Giải thích 2D** | Mặt cắt đơn giản, mũi tên đại lượng, đồ thị, 1–2 công thức SGK | Mỗi 3–4 s thêm một lớp thông tin, không hiện tất cả cùng lúc |
| 37–45 | **Kiểm chứng 3D** | Mặt cắt cho thấy kết quả: đáy nồi nóng đỏ, bọt khí | Cùng màu đại lượng với đoạn 2D |
| 45–51 | **Thử nghiệm đời thường** | Cách kiểm tra tại nhà, ví dụ áp nam châm vào đáy nồi | Tạo hành động cho người xem |
| 51–57 | **Tóm tắt** | Chuỗi nguyên nhân → kết quả gồm 3–4 khung (`chain`) | Mỗi khung một màu đại lượng |
| 57–60 | **Thẻ kết** | Tên kênh, theo dõi, bài sau | `endCard` |

Chuyển cảnh:
- Hai cảnh 3D liền nhau: mờ chồng 0,35 s (`draw3D` tự làm).
- Giữa 3D và 2D: qua màu đen 0,4 s (`dips`).

## Khung thí nghiệm 40 giây (theo video Nam châm trong ống đồng)

| Giây | Đoạn | Nội dung |
|---|---|---|
| 0–9 | Thí nghiệm 3D toàn cảnh | Hai trường hợp đặt cạnh nhau, thả cùng lúc, kết quả khác nhau rõ rệt |
| 9–28 | Giải thích 2D | Mặt cắt, vectơ lực và vận tốc, chiều dòng điện ⊙ ⊗, định luật, phương trình, đồ thị v(t) so với trường hợp đối chứng |
| 28–32 | Cận cảnh 3D | Chi tiết cơ chế, ví dụ vòng dòng điện chạy theo nam châm |
| 32–36 | Ứng dụng | Một ứng dụng thật, ví dụ phanh điện từ |
| 36–39 | Thẻ kết | |

## Viết phụ đề (CAPS)

- Mỗi câu 2,5–4 giây, khoảng 10–16 chữ. Video chưa có giọng đọc thì phụ đề chính là lời kể.
- Câu đầu là **câu hỏi hoặc điều nghịch lí**: "Nồi nước sôi sùng sục, nhưng viên đá ngay bên cạnh vẫn chưa tan."
- Gọi đúng tên SGK: "suất điện động cảm ứng", "dòng điện Foucault", "định luật Lenz". Thuật ngữ mới phải xuất hiện cùng lúc trên hình (nhãn hoặc công thức).
- Phụ đề nói tới vật nào thì vật đó phải **có trong khung lúc đó**. Lỗi hay gặp: máy quay đã lướt qua mà phụ đề vẫn nhắc tới vật ấy.
- Câu chốt ở phần tóm tắt nhắc lại câu hỏi mở đầu.

## Chủ đề gợi ý (chương trình GDPT 2018)

| Lớp, chủ đề | Hiện tượng 3D | Đoạn 2D |
|---|---|---|
| 12 · Cảm ứng điện từ | Bếp từ ✔, sạc không dây, phanh điện từ tàu lượn, máy phát điện xe đạp | Φ(t), e_c = −ΔΦ/Δt, chiều dòng Lenz |
| 12 · Dòng điện xoay chiều | Máy biến áp (lõi thép xuyên thấu, hai cuộn dây), truyền tải điện cao thế | u(t) và i(t), U₁/U₂ = N₁/N₂, hao phí P = I²R |
| 12 · Từ trường | Loa điện động, động cơ điện, nam châm điện ở bãi phế liệu | Lực từ F = BIl sinα, quy tắc bàn tay trái |
| 12 · Vật lí nhiệt, khí lí tưởng | Nồi áp suất, bóng bay trong tủ lạnh, động cơ đốt trong | Đồ thị p–V, pV = nRT |
| 12 · Vật lí hạt nhân | Phản ứng phân hạch dây chuyền, máy chụp PET | Sơ đồ phản ứng, E = mc², chu kì bán rã |
| 11 · Dao động, sóng | Cầu Tacoma, sóng nước giao thoa, lò vi sóng (sóng dừng) | x(t), cộng hưởng, λ = v/f |
| 11 · Điện trường | Máy lọc bụi tĩnh điện, sơn tĩnh điện, tia sét | Đường sức, F = qE |
| 10 · Động lực học | Dây an toàn, túi khí, đi trên vỏ trứng | F = Δp/Δt, đồ thị F(t) |

Một video, một ý. Thiết bị phức tạp (lò vi sóng) chỉ chọn **một** cơ chế để giải thích.
