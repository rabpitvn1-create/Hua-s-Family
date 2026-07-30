# Hứa Gia: LIBERA-1899

Text game trình duyệt lấy bối cảnh Long Hải, Nam Kỳ năm 1899. Người chơi vào vai **Kai**, đặc vụ Elysium mang mật danh **Phantom**, được triển khai trong chiến dịch LIBERA-1899 để cứu Hứa Tiểu Lan và ngăn nghi lễ Giáng Mẫu.

## Trạng thái hiện tại

Vertical Slice 0.2 gồm:

- Hồ sơ nhiệm vụ và quy tắc giao chiến.
- Ba đường thâm nhập có hậu quả khác nhau.
- Chỉ số báo động, áp lực nghi lễ, an toàn dân sự và chứng cứ.
- Cuộc tiếp xúc đầu tiên giữa Kai và Hứa Tiểu Lan.
- Bốn phép kiểm chứng; người chơi phải hoàn thành tối thiểu ba.
- Hệ thống cửa sổ tiếp xúc, quyền chủ động và nguy cơ phát tín hiệu.
- Phản kế có tính toán của Tiểu Lan và mốc cưỡng chế không gây tử vong bắt buộc.
- Avatar nhân vật hiển thị cạnh lời thoại.
- Hiệu ứng chạm khi chọn phương án hội thoại: co nút, vòng sáng tại điểm chạm và đánh dấu lựa chọn trước khi chuyển cảnh.
- Vạch vàng phân tách rõ phần nội dung với khu lựa chọn.
- Huy hiệu lựa chọn dùng số La Mã trên nền vàng.
- Lưu/tải bằng `localStorage`, gồm chuyển bản lưu 0.1 sang 0.2.
- Điều khiển bằng chuột, bàn phím và bố cục responsive.

## Bản chơi thử trực tuyến

- Bản phát hành có vạch vàng và số La Mã: https://rawcdn.githack.com/rabpitvn1-create/Hua-s-Family/6ca99434ffe43013343cc84f5890d27b7d8b6162/index.html
- GitHub Pages: https://rabpitvn1-create.github.io/Hua-s-Family/

## Chạy game cục bộ

Mở trực tiếp `index.html`, hoặc chạy web server cục bộ:

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000`.

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

## Cấu trúc

```text
.
├── assets/
│   └── avatars/
├── index.html
├── styles.css
├── src/
│   ├── dialogue-avatars.js
│   ├── game.js
│   └── story.js
└── docs/
    └── CANON_IMPLEMENTATION.md
```
