# Chọn công cụ cho từng tuyến (từ awesome-claude-video-skills)

Nguồn: <https://github.com/zhuyansen/awesome-claude-video-skills>. Các template trong `templates/` đủ dùng hằng ngày. Bảng dưới đây gợi ý skill cần cài thêm khi muốn nâng cấp.

| Tuyến | Mặc định (có sẵn) | Nâng cấp bằng skill | Khi nào nên nâng cấp |
|---|---|---|---|
| ① Hiểu bản chất | `templates/lab.html` (canvas, mô phỏng theo công thức) | [adithya-s-k/manim_skill](https://github.com/adithya-s-k/manim_skill), [AmitSubhash/3brown1blue](https://github.com/AmitSubhash/3brown1blue): phong cách 3Blue1Brown cho đồ thị, trường vectơ, sóng · [0x68616F4C/auto-popsci](https://github.com/0x68616F4C/auto-popsci): Manim kèm lời bình khoa học phổ thông · [BusyBee3333/animated-explainer-skills](https://github.com/BusyBee3333/animated-explainer-skills): phong cách Kurzgesagt | cần đồ thị và công thức đẹp (LaTeX), hoặc video dài 2–5 phút cho YouTube |
| ② Giải nhanh | `templates/board.html` | [haiderfarooq3/khan-explainer](https://github.com/haiderfarooq3/khan-explainer): bảng đen, nét vẽ chạy theo giọng đọc · [shuyicc/MathLens](https://github.com/shuyicc/MathLens): đưa ảnh đề vào là tự phân tích rồi dựng video Manim (thiết kế cho Toán nhưng dùng được cho bài tập Lý) | khi muốn làm hàng loạt từ ảnh chụp đề |
| ③ Trên lớp hôm nay | quay điện thoại + lớp đồ hoạ chung | [hassancs91/claude-youtube-editor](https://github.com/hassancs91/claude-youtube-editor), [kurbaitaev/ghost-editor](https://github.com/kurbaitaev/ghost-editor), [YeJe-cpu/SeeCut](https://github.com/YeJe-cpu/SeeCut), [darrenli6/JJKoubo](https://github.com/darrenli6/JJKoubo): cắt khoảng lặng, thêm phụ đề động, chèn đồ hoạ · [AgriciDaniel/claude-shorts](https://github.com/AgriciDaniel/claude-shorts): cắt một buổi học dài thành nhiều video ngắn | khi đã quay video buổi học thật |
| ④ Hành trình học viên | `templates/promo.html` | [remotion-dev/skills](https://github.com/remotion-dev/skills): skill chính thức của Remotion · [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) · [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills): biểu đồ động, chữ động | khi cần biểu đồ phức tạp hoặc ghép ảnh, video phỏng vấn |
| ⑤ Tuyển sinh | `templates/promo.html` | [vincentsch/explainroo](https://github.com/vincentsch/explainroo): nhanh nhất trong bài thử, có sẵn nhạc và giọng · [feitangyuan/onetake](https://github.com/feitangyuan/onetake): phim quay một cú máy liền mạch, hợp làm phim giới thiệu trung tâm | phim giới thiệu 30–60 giây cho quảng cáo trả phí |

## Những thứ KHÔNG nên dùng cho trung tâm dạy học

- **Avatar số / người ảo đọc bài** (mục Avatars): phụ huynh cần nhìn thấy giáo viên thật. Avatar làm giảm niềm tin, đúng lúc trung tâm cần niềm tin nhất.
- **Công cụ "nhân bản video viral"** (ví dụ hypit): dễ vi phạm bản quyền, không xây được phong cách riêng của trung tâm.
- **Ảnh AI có chữ, công thức, số liệu**: chữ và số luôn để code vẽ. Ảnh AI chỉ dùng làm minh hoạ không chữ.

## Giọng đọc tiếng Việt

Kokoro, engine mà nhiều skill trong danh sách dùng, **không có tiếng Việt**. Hãy dùng edge-tts (miễn phí), FPT.AI, Vbee, Viettel AI hoặc ElevenLabs, hoặc tốt nhất là thu giọng thật của giáo viên. Chi tiết xem ở `../../triet-tu-chu-han/references/giong-doc.md`.
