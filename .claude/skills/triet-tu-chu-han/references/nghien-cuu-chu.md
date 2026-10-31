# Nghiên cứu một chữ trước khi làm video

## Bốn loại cấu tạo cần nói đúng

Lục thư (六書) có sáu phép. Bốn phép dưới đây dùng để giải thích cấu tạo của chữ (hai phép còn lại là chuyển chú và giả tá).

| Loại | Hán | Ý | Ví dụ | Cách kể trong video |
|---|---|---|---|---|
| Tượng hình | 象形 | vẽ lại hình vật | 日 木 人 山 | cho xem tự dạng giáp cốt / kim văn rồi biến dần thành chữ khải |
| Chỉ sự | 指事 | thêm dấu chỉ vào hình | 本 (gạch ở gốc cây), 上 下 | khoanh tròn dấu chỉ |
| Hội ý | 會意 | ghép các ý lại với nhau | 休 明 好 安 | tách chữ, giải từng phần, rồi ghép lại thành một câu chuyện |
| Hình thanh | 形聲 | một phần chỉ nghĩa, một phần chỉ âm | 媽 河 銅 | **chỉ kể chuyện cho phần chỉ nghĩa**, còn phần chỉ âm thì nói "đọc gần như …" |

Khoảng 80% chữ Hán là hình thanh. Nếu kể chữ hình thanh như thể nó là chữ hội ý thì đó là chiết tự dân gian. Có thể dùng cách đó làm mẹo nhớ, nhưng phải nói rõ ("mẹo nhớ vui:…").

## Trường `etymology` của Make Me a Hanzi

`fetch-char.js` lưu trường này vào `data/<chữ>.json`:

- `{"type":"ideographic","hint":"A person 亻 leaning against a tree 木"}` → hội ý
- `{"type":"pictophonetic","semantic":"宀","phonetic":"豕","hint":"roof"}` → hình thanh, có ghi rõ phần chỉ nghĩa và phần chỉ âm
- `{"type":"pictographic", ...}` → tượng hình

Trường này chỉ là **điểm khởi đầu**, đôi khi nó giản lược hoặc lệch khỏi giới học thuật. Ví dụ 家 bị ghi là hình thanh với 豕 chỉ âm, trong khi nhiều nhà nghiên cứu coi đây là chữ hội ý (nuôi lợn dưới mái nhà). Khi các nguồn không thống nhất, hãy nói "có hai cách giải thích".

## Nguồn để đối chiếu

- **Thuyết văn giải tự (說文解字)**, sách của Hứa Thận. Đây là nguồn kinh điển, ví dụ với 休 sách viết: "息止也。从人依木". Có thể tra trên ctext.org hoặc zdic.net (mục 說文解字).
- **Tự dạng cổ** (giáp cốt, kim văn, triện): 小學堂 (xiaoxue.iis.sinica.edu.tw), 汉典 zdic.net (mục 字源字形), Wiktionary (mục Glyph origin, có ảnh tự dạng cổ). Ảnh tự dạng cổ trên Wikimedia Commons có ghi giấy phép riêng cho từng ảnh, hãy kiểm tra trước khi dùng.
- **Âm Hán Việt và nghĩa tiếng Việt**: Hán Việt tự điển của Thiều Chửu, hvdic.thivien.net, Từ điển Hán Nôm (hannom.org.vn).
- **Từ ghép thông dụng**: chọn từ mà người Việt có dùng (hưu trí, thoái hưu) xen với từ tiếng Trung hiện đại (休息). Ghi chú rõ từ nào thuộc loại nào.

## Ghi chép trước khi viết kịch bản

```
Chữ: 休   Hán Việt: hưu   Pinyin: xiū   Nghĩa: nghỉ ngơi
Cấu tạo: ⿰ 亻(nhân – người) + 木 (mộc – cây)     Loại: hội ý
Thuyết văn: 息止也。从人依木 (nghỉ, dừng lại; người tựa cây)
Tự dạng cổ: giáp cốt vẽ một người đứng cạnh cây
Từ ghép: 休息 hưu tức · 退休 thoái hưu · 休假 hưu giả (nghỉ phép)
Mẹo nhớ (nếu có): —
Nguồn đã tra: zdic.net, Thiều Chửu
```

## Bản quyền dữ liệu

- Nét chữ (`hanzi-writer-data`, `graphics.txt`) lấy từ font Arphic, phát hành theo **Arphic Public License**, được phép dùng cho mục đích thương mại.
- `dictionary.txt` (cấu tạo, từ nguyên) phát hành theo **LGPL**. Dùng nội dung trong video thì không vấn đề gì. Nếu phân phối lại chính tệp dữ liệu thì phải giữ nguyên giấy phép.
- Ở phần mô tả video, nên ghi: "Dữ liệu nét chữ: Make Me a Hanzi / Hanzi Writer".
