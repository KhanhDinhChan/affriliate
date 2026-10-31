# Học được gì từ awesome-claude-video-skills (mục Explainers)

Nguồn: <https://github.com/zhuyansen/awesome-claude-video-skills#type-explainer>. Danh sách này có 385 repo, trong đó 67 repo thuộc mục Explainers. Mục Explainers không có skill nào làm riêng về chữ Hán, nên skill này ghép các kỹ thuật lấy từ những repo gần nhất dưới đây.

| Repo | Lấy gì | Không lấy gì, vì sao |
|---|---|---|
| [haiderfarooq3/khan-explainer](https://github.com/haiderfarooq3/khan-explainer) | **Giọng đọc quyết định thời gian**: beat = một câu + hình vẽ trong lúc đọc câu đó. Ảnh *sheet* chụp cuối mỗi beat để soát bố cục. Board tích luỹ dần, chỉ xoá khi đầy. Mỗi khái niệm một màu. | Repo này chỉ chạy trên macOS (dùng `say`). Nó viết chữ Hán bằng cách hiện dần font chứ không vẽ từng nét theo đúng thứ tự. |
| [hi-nikola/hand-drawn-explainer-video-nikola](https://github.com/hi-nikola/hand-drawn-explainer-video-nikola) | Phân biệt rõ hai cách làm: "vẽ ra từng nét" và "các phần tử chuyển động", không đánh tráo cách này thành cách kia. Chữ chính xác (tên riêng, chữ Hán) phải là lớp chữ do code vẽ, không để mô hình tạo ảnh viết. Thời gian lấy từ audio thật. Phải giải mã toàn bộ MP4 khi nghiệm thu. | Repo này phụ thuộc giọng Volcengine trả phí và một backend Python khá nặng. |
| [AllenAI2014/remotion-guofeng-starter](https://github.com/AllenAI2014/remotion-guofeng-starter) | **Bảng màu quốc phong** (đỏ son #8f2019, mực #241a14, giấy #efe2c6, son đất #b3833f): chỉ một màu bão hoà và dùng với diện tích nhỏ. Không để chữ trong ảnh cắt giấy, chữ do code vẽ. Chia tiền cảnh và hậu cảnh để tạo chiều sâu. Quy trình 6 bước: phân cảnh → tài sản → dựng cảnh → giọng đọc → xuất. | Repo này dùng Remotion và ảnh AI, có thể dùng khi muốn nâng cấp tranh minh hoạ. |
| [chuspeeism/dashi-animationstyle](https://github.com/chuspeeism/dashi-animationstyle) | Bộ **quy tắc trình bày** đã đo trên người xem thật: cỡ chữ tối thiểu, độ tương phản WCAG, vùng an toàn cho phụ đề, thời gian dừng = số chữ/9 + 0,5 giây, hiệu ứng vào cảnh 0,2–0,5 giây, khung hình chỉ phụ thuộc t. | 7 phong cách vẽ của repo này. Video triết tự chỉ cần một phong cách nhất quán. |
| [vincentsch/explainroo](https://github.com/vincentsch/explainroo) | Làm việc với hai tệp: lời đọc và tệp JS vẽ hình. Giọng đọc chạy local. Bước `verify` sau khi render. Đây là repo xếp hạng 1 về tốc độ trong bài thử. | Kokoro, engine TTS của repo này, không có tiếng Việt. |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Dùng khi muốn chuyển sang Remotion để có timeline, chuyển cảnh và chỉnh trong Studio. | Lần đầu cài khá nặng. Một video triết tự ngắn không cần đến. |
| [Ali-Aria/aria-animator](https://github.com/Ali-Aria/aria-animator) | Gợi ý font 霞鹜文楷 (LXGW WenKai, mã nguồn mở) cho nhãn chữ Hán có nét khải thư. | |

## Dữ liệu nét chữ

Không repo nào trong danh sách có sẵn dữ liệu nét chữ. Skill này dùng dữ liệu của **Make Me a Hanzi** (thông qua `hanzi-writer-data`), gồm:

- `strokes`: đường viền SVG của từng nét, đã xếp theo đúng thứ tự viết;
- `medians`: đường tâm của mỗi nét, dùng để vẽ nét chạy theo đúng hướng bút;
- `matches` + `decomposition`: cho biết mỗi nét thuộc bộ phận nào. Đây chính là thứ giúp **tách và ghép bộ phận** được.

Kỹ thuật vẽ (giống Hanzi Writer): cắt vùng vẽ theo đường viền của nét, rồi kéo một đường rất dày dọc theo `median`, dài dần theo tiến độ. Nhờ vậy nét hiện ra đúng hướng bút và không lem ra ngoài chữ.
