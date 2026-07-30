# Bước triển khai tiếp theo

Mã AI quản trò đã có trong repository, nhưng GitHub Pages không chạy được backend `api/gemini-turn.js`.

## Kiểm tra khóa Gemini

Workflow `.github/workflows/gemini-smoke-test.yml` chạy khi pull request thay đổi mã Gemini và cũng có thể chạy thủ công. Workflow dùng `GEMINI_API_KEY` từ GitHub Actions Secret để gọi thử model `gemini-3.6-flash` mà không in khóa ra log.

## Đưa game lên Vercel

1. Đăng nhập Vercel bằng GitHub.
2. Tạo project mới và import repository `rabpitvn1-create/Hua-s-Family`.
3. Giữ Root Directory là thư mục gốc repository.
4. Thêm Environment Variable `GEMINI_API_KEY` cho Production và Preview.
5. Triển khai project.
6. Mở URL Vercel và thử ô **Hành động tự do**.

GitHub Actions Secret và Vercel Environment Variable là hai nơi lưu riêng biệt. Giá trị đã nhập ở GitHub không tự chuyển sang Vercel.
