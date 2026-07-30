# Canon implementation notes

## Nguồn ưu tiên đã đối chiếu

- `[Codex]Elysium.md`: chiến dịch LIBERA-1899, Kai/Phantom, mục tiêu, quy tắc giao chiến và các mốc giải cứu bắt buộc.
- `[Codex]HuaTieuLan.docx`: nhận thức, tính cách, điểm mù, cách phản ứng và giọng nói của Hứa Tiểu Lan.
- `[Source]Bối cảnh thế giới.docx`: Long Hải, cấu trúc Hứa Gia, Tử Mẫu Trùng và giới hạn chiến thắng cục bộ.
- `[Codex]Kai.docx`: tính cách và nguyên tắc vận hành của Kai.
- `[Source]QuyTacDoiThoai.docx`: lời thoại đúng điểm nhìn, mục đích và thời đại.

## Quyết định triển khai trong Vertical Slice 0.1

- Tên nhân vật chính được khóa là `Kai`; `Phantom` chỉ là mật danh tác chiến.
- Không viết lời thoại trực tiếp của Tiểu Lan ở bản đầu; chương kết thúc ngay trước tiếp xúc để tránh tự bổ sung ba dữ kiện kiểm chứng và nhịp cưỡng chế chưa được thiết kế chi tiết.
- Chỉ số game thể hiện hậu quả chiến thuật, không thay thế canon. Các nhánh sau phải hội tụ về sự kiện giải cứu bắt buộc.
- Đường đi, nhịp canh và các vật thể trong cảnh chỉ được mô tả ở mức chức năng đã được nguồn xác nhận; chưa tạo sơ đồ biệt thự cố định.

## Canon tên nhân vật

- `Kai`: tên nhân vật chính đang có hiệu lực.
- `Phantom`: mật danh của Kai trong chiến dịch.
- `Cao Minh`: thuộc tài liệu đã bỏ, không được dùng làm tên hoặc bí danh trong nội dung mới.

## Phạm vi chương tiếp theo

1. Thiết kế ba dữ kiện Kai có thể đưa ra để Tiểu Lan kiểm chứng ngay.
2. Viết cuộc đối thoại ngắn với quyền chủ động thay đổi qua từng lượt.
3. Thực hiện phản kế của Tiểu Lan và mốc khống chế không gây chết người.
4. Tách người được bảo hộ, phá điểm neo và mở tuyến rút.
