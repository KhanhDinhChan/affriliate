# Chế độ KHXH — ảnh, bản đồ, dòng thời gian

Ở các môn KHXH, nhiệm vụ của hình là **cho học sinh nhìn thấy**: con người, nơi chốn, đồ vật, mốc thời gian. Mỗi beat nên có một hình. Một khung chỉ có chữ là khung yếu.

## 1. Ảnh

```js
{ image: 'assets/anh.jpg', id: 'img', in: 'visual', frame: 'photo', kb: [[1.0, 0.5, 0.5], [1.15, 0.6, 0.4]],
  credit: 'Nguồn: … · Giấy phép: …' }
{ pin: 'img', at: [0.32, 0.7], label: 'ruộng bậc thang' }     // ghim chú thích theo toạ độ trên ảnh gốc (0..1)
{ highlight: 'img', label: '…' }                               // khung quanh cả ảnh
```

- `frame: 'photo'` cho ảnh tư liệu: viền trắng, hơi nghiêng, đổ bóng, kiểu ảnh dán trong sổ. Bỏ `frame` khi ảnh phủ kín vùng.
- `kb` là hiệu ứng **Ken Burns**: ảnh phóng nhẹ hoặc trượt chậm theo suốt beat, theo dạng [tỉ lệ, tâm u, tâm v] từ đầu đến cuối beat. Nên đưa tâm về phía chi tiết đang được nhắc tới. Không phóng quá 1,25 lần, để ảnh không vỡ hạt.
- `pin` khoanh và gắn nhãn chi tiết trên ảnh. Mỗi ảnh tối đa 3 ghim.
- `fit: 'contain'` dùng cho tranh, bản đồ cổ hay văn bản, khi không được cắt mất phần nào.

### Ba loại ảnh — phải phân biệt rõ trên màn hình

| Loại | Ví dụ | Bắt buộc |
|---|---|---|
| **Ảnh, tư liệu thật** | ảnh lịch sử, hiện vật, văn bản gốc, ảnh địa danh | dòng `credit`: tác giả hoặc cơ quan lưu trữ, cùng giấy phép |
| **Hình minh hoạ** (vẽ, sơ đồ, tái hiện) | cảnh trận đánh vẽ lại, sơ đồ đô thị cổ | `ai: 'HÌNH MINH HOẠ'` và `credit` |
| **Ảnh tạo bằng AI** | cảnh sinh hoạt thời xưa, ý niệm trừu tượng | `ai: true` (hiện "ẢNH MINH HOẠ AI") |

Quy định:
1. **Không bao giờ để ảnh AI hay hình vẽ lại trông như ảnh tư liệu thật**, nhất là với nhân vật và sự kiện lịch sử. Không tạo ảnh AI giả chân dung nhân vật lịch sử có thật.
2. Ảnh AI không được có chữ, ngày tháng hay số liệu. Mọi chữ do bộ máy vẽ đè lên.
3. Chỉ dùng ảnh **được phép dùng**: ảnh tự chụp; ảnh phạm vi công cộng hoặc giấy phép mở (Wikimedia Commons, phải kiểm tra giấy phép của **từng tệp**; ảnh CC BY và CC BY-SA phải ghi tên tác giả); ảnh mua bản quyền; ảnh được cơ quan lưu trữ hoặc bảo tàng cho phép. Ảnh lấy từ báo, Google Hình ảnh hay kênh khác **không** được dùng nếu chưa được phép.
4. Giữ một tệp `assets/NGUON.md` ghi rõ nguồn, giấy phép và đường dẫn của từng ảnh.

## 2. Bản đồ

```js
{ map: true, id: 'm', in: 'visual', view: [lonT, latN, lonĐ, latB] /* vd [95, 5, 125, 25] */, to: [...], highlight: { 704: 'subject' },
  labels: [[105.85, 21.03, 'Hà Nội', { dot: true }], [117.6, 13.4, 'Biển Đông', { sea: true }]] }
{ mapTo: 'm', view: [...], highlight: {...}, labels: [...] }   // camera bay, đổi vùng tô màu, đổi nhãn
```

- Bản đồ vẽ bằng code từ **Natural Earth** (phạm vi công cộng), nên sắc nét ở mọi cỡ, đổi màu tuỳ ý và tự ghi nguồn.
- `highlight` dùng mã nước ISO dạng số: Việt Nam 704, Lào 418, Campuchia 116, Trung Quốc 156, Thái Lan 764, Pháp 250, Mỹ 840, Nhật 392.
- **Chủ quyền là bắt buộc.** Dữ liệu Natural Earth không có Hoàng Sa và Trường Sa. Bộ máy **tự vẽ QĐ. Hoàng Sa (Đà Nẵng) và QĐ. Trường Sa (Khánh Hoà) cùng màu lãnh thổ Việt Nam** mỗi khi khung nhìn chứa Biển Đông. Không được tắt chức năng này (`vn: false`) cho bản đồ có vùng Biển Đông.
- Gọi tên **"Biển Đông"**. Không dùng tên gọi khác, và không dùng bản đồ tải từ nước ngoài có "đường lưỡi bò" hay thiếu hai quần đảo. Phát hành bản đồ sai chủ quyền có thể bị xử phạt theo quy định về đo đạc và bản đồ (Nghị định 18/2020/NĐ-CP).
- Dùng ảnh bản đồ có sẵn (bản đồ cổ, bản đồ SGK, Atlat) thì chèn bằng `image` với `fit: 'contain'`, ghi nguồn, và vẫn phải kiểm tra yếu tố chủ quyền.
- Lịch sử: kết hợp `map` với `arrow` để vẽ hướng tiến quân hoặc tuyến đường. Khi không chắc toạ độ chính xác, ghi chú rõ là sơ đồ minh hoạ.

## 3. Dòng thời gian

```js
{ timeline: [['1945', '…'], ['1954', '…'], ['1975', '…']], id: 'tl', in: 'visual', y: 0.58 }
{ tl: 'tl', active: 1 }    // làm nổi một mốc, các mốc khác mờ đi
```

Vùng rộng thì dòng thời gian nằm ngang, vùng cao thì nằm dọc. Mỗi dòng thời gian tối đa 5–6 mốc. Nhiều hơn thì chia thành các giai đoạn, mỗi giai đoạn một dòng.

## 4. Gợi ý theo môn

| Môn | Hình đặc trưng | Đồ vật |
|---|---|---|
| **Lịch sử** | ảnh tư liệu, hiện vật, bản đồ diễn biến, chân dung (ảnh thật) | `image` + `pin`, `map` + `arrow`, `timeline`, `card` (khái niệm, ý nghĩa) |
| **Địa lí** | bản đồ, biểu đồ số liệu, ảnh cảnh quan | `map`, `image`, biểu đồ vẽ bằng `draw` hoặc `plot` (số liệu ghi rõ nguồn và năm) |
| **Ngữ văn** | chân dung tác giả, bìa sách, tranh bối cảnh, câu thơ trích | `quote` (trích **nguyên văn**, ghi tác giả và tác phẩm), `image`, `card` (biện pháp tu từ) |
| **GDKT & PL** | tình huống đời sống, sơ đồ khái niệm, trích điều luật | `card`, `bullets`, ảnh minh hoạ tình huống (`ai: true`), trích luật ghi số điều và tên văn bản |

## 5. Nội dung nhạy cảm

Lịch sử, chủ quyền và pháp luật trình bày **theo SGK và văn bản chính thống**. Ghi rõ nguồn khi trích, không bình luận chính trị ngoài chương trình. Chưa chắc chắn thì kiểm tra lại, đừng đoán.
