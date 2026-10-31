# Giọng đọc tiếng Việt

Các skill trong danh sách awesome thường dùng Kokoro, macOS `say`, ElevenLabs, MiniMax hoặc Doubao. **Kokoro không có tiếng Việt**, vì vậy với video triết tự tiếng Việt, nên chọn theo thứ tự sau:

| Lựa chọn | Chi phí | Chất lượng | Cách dùng |
|---|---|---|---|
| **edge-tts** `vi-VN-HoaiMyNeural` (nữ), `vi-VN-NamMinhNeural` (nam) | miễn phí, cần mạng | khá tự nhiên | `pip install edge-tts` → `node scripts/voice-edge.js scene.js` |
| FPT.AI TTS, Vbee, Viettel AI, Zalo AI | trả phí hoặc có gói miễn phí | rất tự nhiên, nhiều giọng vùng miền | tạo file theo từng beat, đặt vào `vo/NN.mp3` |
| ElevenLabs `eleven_multilingual_v2` | trả phí | tự nhiên, có thể nhân bản giọng của bạn | xuất từng câu ra `vo/NN.mp3` |
| macOS `say -v Linh` | miễn phí, offline | máy móc | `say -v Linh -o vo/00.aiff "…"` rồi đổi sang mp3 bằng ffmpeg |
| Tự thu âm | miễn phí | tốt nhất cho kênh lâu dài | mỗi câu một file, hoặc thu cả bài rồi cắt theo khoảng lặng |

## Mẹo

- **Một câu một file**, đặt tên `00.mp3`, `01.mp3`… theo đúng số thứ tự beat (beat không có `say` thì bỏ qua số đó). `render.js` tự lấy độ dài file làm độ dài beat, cộng thêm `gap`.
- **Đọc âm Hán Việt, hiển thị chữ Hán.** TTS tiếng Việt không đọc được 休, nên `say` viết là "chữ Hưu", còn chữ 休 nằm trên màn hình. Khi cần TTS đọc khác chữ hiển thị (ví dụ tên riêng, chữ đa âm như 行 hành/hàng, 樂 lạc/nhạc), dùng `speak`.
- **Tốc độ**: edge-tts đọc `+0%` khoảng 4–4,5 âm tiết/giây. Với video học tập, nên dùng `-5%`.
- **Ghép một lần đọc liền mạch**: nếu thu cả bài trong một file, dùng `ffmpeg -af silencedetect` tìm các khoảng lặng, cắt ra thành `vo/NN.wav` cho từng câu, rồi render như bình thường.
- **Nhạc nền**: đặt `music: 'bgm.mp3'` với `musicVolume` khoảng 0,08–0,15. Nên chọn nhạc cụ dân tộc (cổ tranh, tiêu) không lời, giấy phép miễn phí.
