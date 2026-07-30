# Hứa Gia: LIBERA-1899

Text game trình duyệt lấy bối cảnh Long Hải, Nam Kỳ năm 1899. Người chơi vào vai **Kai**, đặc vụ Elysium mang mật danh **Phantom**, được triển khai trong chiến dịch LIBERA-1899 để cứu Hứa Tiểu Lan và ngăn nghi lễ Giáng Mẫu.

## Trạng thái hiện tại

Vertical Slice 0.3 gồm:

- Hồ sơ nhiệm vụ và quy tắc giao chiến.
- Ba đường thâm nhập có hậu quả khác nhau.
- Chỉ số báo động, áp lực nghi lễ, an toàn dân sự và chứng cứ.
- Cơ chế đụng độ tám loại vật chủ dị biến; loại xuất hiện phụ thuộc đường thâm nhập, báo động, áp lực nghi lễ và chứng cứ.
- Tám ảnh encounter WebP độ phân giải cao, hiển thị theo đúng tỷ lệ.
- Ba hướng xử lý ban đầu: phân loại, khống chế bằng xung điện hoặc dùng hỏa lực.
- Kết quả đụng độ tác động tới báo động, tiến độ nghi lễ, an toàn dân sự và chứng cứ thu hồi.
- Cuộc tiếp xúc đầu tiên giữa Kai và Hứa Tiểu Lan.
- Bốn phép kiểm chứng; người chơi phải hoàn thành tối thiểu ba.
- Hệ thống cửa sổ tiếp xúc, quyền chủ động và nguy cơ phát tín hiệu.
- Phản kế có tính toán của Tiểu Lan và mốc cưỡng chế không gây tử vong bắt buộc.
- Avatar nhân vật hiển thị cạnh lời thoại.
- Lưu/tải bằng `localStorage`, gồm chuyển bản lưu 0.1 sang 0.2.
- **Nhánh hành động tự do do Gemini 3.6 Flash quản trò**, với ba gợi ý sau mỗi lượt.
- AI chỉ đề xuất hậu quả trong giới hạn; game engine vẫn giữ canon, cảnh chính và trạng thái nhiệm vụ.
- Backend serverless không để lộ `GEMINI_API_KEY` cho trình duyệt.

## Bản chơi thử trực tuyến

- GitHub Pages, chỉ có phần game tĩnh: https://rabpitvn1-create.github.io/Hua-s-Family/
- Nhánh AI cần triển khai repository trên Vercel hoặc một backend tương thích. Xem [`docs/GEMINI_SETUP.md`](docs/GEMINI_SETUP.md).

## Chạy game tĩnh cục bộ

Mở trực tiếp `index.html`, hoặc chạy web server cục bộ:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`. Phần truyện cố định hoạt động; AI không hoạt động vì không có backend.

## Chạy đầy đủ với Gemini

```bash
npm install -g vercel
cp .env.example .env.local
vercel dev
```

Điền `GEMINI_API_KEY` trong `.env.local`, không commit file này. Hướng dẫn đầy đủ ở [`docs/GEMINI_SETUP.md`](docs/GEMINI_SETUP.md).

## Nguyên tắc canon đang áp dụng

1. Cốt truyện mở tại biệt thự Hứa Gia ở Long Hải năm 1899.
2. Tiểu Lan tự nguyện tới Long Hải vì tin cha đưa mình đi dưỡng bệnh; cô chưa biết kế hoạch hiến tế.
3. Mọi người làm công chính thức tại biệt thự mang Tử Mẫu Trùng, nhưng không mặc nhiên có cùng mức tội.
4. Tiểu Lan không mang trùng vì được chuẩn bị làm vật chứa trực tiếp.
5. Kai phải cứu người, phá nghi lễ, bảo toàn dân thường, thu hồi công nghệ tương lai và tôn trọng quyền tự quyết của Tiểu Lan.
6. Kai cung cấp tối thiểu ba dữ kiện có thể kiểm chứng, không yêu cầu Tiểu Lan tin toàn bộ câu chuyện.
7. Tiểu Lan phản kháng bằng quan sát, trì hoãn, giả yếu, hợp tác có điều kiện và tín hiệu có mục đích; cô không chạy loạn.
8. Khi phản kế trực tiếp đe dọa nhiệm vụ, Kai đánh ngất cô bằng báng súng tại vùng cổ-gáy với lực được kiểm soát, đỡ cô trước khi ngã và theo dõi y tế.
9. Phá Long Hải chỉ cắt một chân rết, không tiêu diệt toàn bộ Hứa Gia hoặc Quỷ Tử Mẫu.
10. Amy/Delta và Koei không mặc nhiên hiện diện trong chiến dịch Long Hải.
11. Không dùng lại các thiết lập cũ về Tây viện, giam Tiểu Lan tại Chợ Lớn, Huyết Tử Động, Mẫu Thai hoặc không gian chồng lấn.
12. `Kai` là tên nhân vật; `Phantom` chỉ là mật danh. `Cao Minh` thuộc tài liệu đã bỏ.
13. Vật chủ thức tỉnh phải được phân loại theo hành vi, vai trò và khả năng cứu; mang ký sinh không tự động biến mọi người thành mục tiêu tiêu diệt.
14. Mỗi biến đổi cơ thể phải có chức năng chiến thuật và hậu quả, không chỉ dùng như trang trí kinh dị.
15. AI không được tự sửa mốc canon, tạo năng lực mới hoặc biến hành động của người chơi thành chiến thắng vô điều kiện.

## Cấu trúc

```text
.
├── .github/workflows/
│   └── gemini-smoke-test.yml
├── api/
│   └── gemini-turn.js
├── assets/
│   ├── avatars/
│   └── encounters/
├── docs/
│   ├── CANON_IMPLEMENTATION.md
│   └── GEMINI_SETUP.md
├── scripts/
│   └── test-gemini.mjs
├── src/
│   ├── ai-game-master.js
│   ├── dialogue-avatars.js
│   ├── encounters.js
│   ├── game.js
│   └── story.js
├── .env.example
├── ai-styles.css
├── index.html
├── package.json
├── styles.css
└── vercel.json
```
