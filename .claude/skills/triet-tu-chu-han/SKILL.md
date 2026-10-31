---
name: triet-tu-chu-han
description: Làm video triết tự (chiết tự) chữ Hán bằng tiếng Việt — viết chữ từng nét theo đúng thứ tự, tách chữ thành các bộ phận tô màu riêng, giải nghĩa từng phần, vẽ minh hoạ, ghép lại thành công thức (亻 + 木 = 休), kèm phụ đề và giọng đọc. Dùng khi người dùng muốn "triết tự / chiết tự chữ X", "giải nghĩa chữ Hán bằng video", "video học chữ Hán", "TikTok/Shorts chữ Hán", hoặc đưa một danh sách chữ cần làm video. Xuất MP4 dọc 9:16 hoặc ngang 16:9, chạy local, không cần API trả phí.
---

# Video triết tự chữ Hán

Một chữ Hán, một video ngắn: chữ được **viết ra từng nét**, rồi **tách ra** thành các bộ phận (mỗi bộ phận một màu), mỗi phần được **giải nghĩa** đúng lúc giọng đọc nhắc tới, sau đó **ghép lại** thành công thức và từ ghép hay gặp.

Bộ công cụ trong `scripts/` được dựng từ những gì học được ở danh sách
[awesome-claude-video-skills › Explainers](https://github.com/zhuyansen/awesome-claude-video-skills#type-explainer)
(xem [references/hoc-tu-repo.md](references/hoc-tu-repo.md)): khung hình chỉ phụ thuộc thời gian t, giọng đọc quyết định nhịp, có ảnh "sheet" để kiểm tra bố cục sau mỗi lần render.

## Nguyên tắc cốt lõi

1. **Đúng trước, đẹp sau.** Triết tự rất dễ sa vào chiết tự dân gian. Mỗi chữ phải xác định loại cấu tạo (tượng hình, chỉ sự, hội ý, hình thanh) theo nguồn tin cậy trước khi viết kịch bản. Nếu dùng cách nhớ dân gian thì nói rõ đó là mẹo nhớ. Xem [references/nghien-cuu-chu.md](references/nghien-cuu-chu.md).
2. **Giọng đọc quyết định thời gian.** Mỗi beat là một câu thoại cộng với các hành động vẽ diễn ra trong lúc đọc câu đó. Có file giọng thì độ dài beat lấy từ file, không đoán số giây.
3. **Mỗi beat một ý.** Một câu thoại 1,5–5 giây, mỗi lần chỉ làm một việc: viết chữ, tách, giải nghĩa một phần, hoặc ghép.
4. **Một màu cho một bộ phận, giữ suốt video.** Nếu 亻 là màu đỏ son thì nhãn, công thức và phụ đề nhắc tới 亻 cũng dùng màu đó.
5. **Chữ Hán do code vẽ, không nhờ mô hình tạo ảnh.** Nét chữ lấy từ dữ liệu Make Me a Hanzi nên không bao giờ sai chữ. Ảnh AI chỉ dùng cho tranh minh hoạ, và trong ảnh không được có chữ.

## Quy trình

1. **Nghiên cứu chữ.** Lấy dữ liệu: `node scripts/fetch-char.js <dự-án>/data 休`. Lệnh này in ra cấu tạo (⿰亻木), loại từ nguyên và gợi ý gốc (bằng tiếng Anh). Sau đó đối chiếu với Thuyết văn giải tự, Hán Việt tự điển (Thiều Chửu) và tự dạng cổ (giáp cốt, kim văn, triện) theo [nghien-cuu-chu.md](references/nghien-cuu-chu.md). Ghi lại: âm Hán Việt, pinyin, nghĩa gốc, các bộ phận kèm âm và nghĩa, 2–3 từ ghép thông dụng.
2. **Viết kịch bản theo beat**, theo khung 30–45 giây dưới đây. Viết lời đọc trước, sau đó mới tính phần hình.
3. **Viết `scene.js`**: chép `examples/huu/scene.js` rồi sửa (xem kết quả mẫu ở `examples/huu/demo/`). API đầy đủ ở [references/scene-api.md](references/scene-api.md).
4. **Render nháp không tiếng** để chỉnh bố cục: `node scripts/render.js <dự-án>/scene.js`. Render mất khoảng 1 phút cho 25 giây video.
5. **Mở ảnh `sheet.jpg`** mà lệnh render in ra (chụp cuối mỗi beat), cùng các ảnh `bNN.jpg` cỡ gốc. Kiểm tra: nhãn có tràn mép không, có chữ nào đè lên nhau không, có thứ gì lọt vào vùng phụ đề không, hình minh hoạ có nằm giữa khung không. Sửa rồi render lại.
6. **Thêm giọng đọc**: dùng `node scripts/voice-edge.js <dự-án>/scene.js` hoặc tự đặt file vào `vo/00.mp3`, `vo/01.mp3`… rồi thêm `voiceDir: 'vo'` vào scene. Các lựa chọn giọng đọc ở [references/giong-doc.md](references/giong-doc.md).
7. **Render bản cuối và nghiệm thu**: `ffmpeg -v error -i out/scene.mp4 -f null -` không được báo lỗi. Xem lại 0,5 giây cuối và nghe xem tiếng có khớp với hình không. Báo cho người dùng đường dẫn MP4, độ dài, giọng đã dùng và các nguồn từ nguyên đã tra.

Lần đầu chạy trên máy mới: `cd scripts && npm install && npx playwright install chromium`. Máy cũng cần có `ffmpeg`. Để hiển thị dấu tiếng Việt cần font serif có dấu (DejaVu Serif hoặc Noto Serif), còn nhãn chữ Hán cần một font CJK (KaiTi, Noto Serif CJK hoặc WenQuanYi).

## Khung kịch bản 30–45 giây (dọc 9:16)

| # | Beat | Hình | Lời đọc mẫu |
|---|---|---|---|
| 0 | Mở đầu | tiêu đề + **viết chữ từng nét** trên ô mễ tự | "Hôm nay mình triết tự chữ Hưu, nghĩa là nghỉ ngơi." |
| 1 | Tách | `split` | "Chữ này ghép từ hai phần…" |
| 2…n | Giải từng phần | `label` (tự làm mờ các phần còn lại) | "Bên trái là bộ Nhân đứng, tức là con người." |
| n+1 | Hình dung / cổ văn | `sketch` hoặc `image` (giáp cốt, kim văn) | "Hãy hình dung một người tựa lưng vào gốc cây." |
| n+2 | Ghép | `merge` + công thức `亻 + 木 = 休` | "Người tựa gốc cây, chính là lúc nghỉ ngơi." |
| n+3 | Dùng ở đâu | 2–3 từ ghép kèm âm Hán Việt | "Hưu tức là nghỉ ngơi, thoái hưu là nghỉ hưu." |
| (tuỳ) | Kêu gọi | text | "Bạn muốn triết tự chữ nào tiếp theo?" |

Với **chữ hình thanh** (形聲), đừng bịa ra câu chuyện cho phần chỉ âm. Hãy nói rõ: "phần 宀 (mái nhà) chỉ nghĩa, phần … chỉ âm đọc". Có thể tô phần chỉ âm bằng một màu trung tính.

## Quy tắc trình bày (rút ra từ dashi-animationstyle, đo trên khổ 1080 px)

- Phụ đề ≥ 50 px, tối đa 2 dòng. Chữ chính ≥ 55% chiều rộng khung. Nhãn ≥ 48 px để vẫn đọc được trên điện thoại.
- Khoảng 15% chiều cao phía dưới chỉ dành cho phụ đề, hình vẽ không đi vào vùng này. Chừa lề 5% mỗi bên.
- Chữ hiện lên phải đứng yên đủ lâu để đọc: số chữ ÷ 9 + 0,5 giây. Sau khi ghép xong công thức, dừng ≥ 1 giây.
- Mỗi hiệu ứng vào cảnh kéo dài 0,2–0,5 giây, dùng đường cong easing chậm vào chậm ra, không chuyển động đều.
- Màu sắc: nền giấy và mực đen, mỗi bộ phận một màu nhấn. Theme `paper` dùng bảng màu quốc phong (đỏ son #8f2019, xanh mực, xanh rêu, son đất). Theme `board` là bảng đen phấn trắng.

## Nâng cấp khi cần

- **Tranh minh hoạ đẹp hơn que diêm**: tạo ảnh không có chữ bằng mô hình tạo ảnh rồi đưa vào bằng `{ image }`. Có thể làm theo phong cách cắt giấy quốc phong (remotion-guofeng-starter) hoặc tranh vẽ tay vẽ dần từng vùng (hand-drawn-explainer-video-nikola).
- **Dựng bằng Remotion** để có timeline trực quan, chuyển cảnh và nhạc: cài skill `remotion-dev/skills`, chuyển `page.js` thành component, vẫn dùng dữ liệu nét chữ y như cũ.
- **Làm hàng loạt**: mỗi chữ một thư mục `scene.js`, dùng chung một mẫu, chỉ thay dữ liệu (chữ, các bộ phận, lời đọc).
