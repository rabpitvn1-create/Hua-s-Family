# Bật AI quản trò Gemini

Repository đã có sẵn giao diện nhập hành động tự do và backend `api/gemini-turn.js` dùng model ổn định `gemini-3.6-flash`.

## Điều quan trọng về GitHub Pages

GitHub Pages chỉ phục vụ HTML, CSS và JavaScript tĩnh. Nó không thể đọc `GEMINI_API_KEY` trong GitHub Actions Secrets khi người chơi đang bấm nút trong game.

Secret đã nhập trong GitHub vẫn hữu ích cho workflow **Kiểm tra Gemini API**, nhưng để AI phản hồi trực tiếp trong game, repository cần được chạy trên một nền tảng có serverless function như Vercel.

## Cách đơn giản nhất: triển khai toàn bộ bằng Vercel

1. Đăng nhập Vercel bằng tài khoản GitHub.
2. Chọn **Add New → Project**.
3. Chọn repository `rabpitvn1-create/Hua-s-Family`.
4. Trong **Environment Variables**, thêm:

```text
Name: GEMINI_API_KEY
Value: khóa Gemini của bạn
```

5. Bấm **Deploy**.
6. Mở URL Vercel vừa tạo. Giao diện game và `/api/gemini-turn` sẽ chạy cùng tên miền nên không cần cấu hình thêm.

Không dán API key vào `index.html`, `src/*.js`, README hoặc bất kỳ file nào được commit.

## Chạy cục bộ

Cần Node.js 20 trở lên và Vercel CLI:

```bash
npm install -g vercel
cp .env.example .env.local
```

Mở `.env.local` và điền:

```text
GEMINI_API_KEY=khóa_của_bạn
```

Sau đó chạy:

```bash
vercel dev
```

Mở địa chỉ Vercel CLI hiển thị, thường là `http://localhost:3000`.

## Kiểm tra secret trong GitHub

Repository có workflow thủ công `.github/workflows/gemini-smoke-test.yml`.

1. Mở tab **Actions**.
2. Chọn **Kiểm tra Gemini API**.
3. Chọn **Run workflow**.

Workflow chỉ báo key/model có gọi được hay không. Nó không biến GitHub Pages thành backend.

## Cách AI được giới hạn

- AI chỉ tạo nhánh phụ trong cảnh hiện tại; không tự chuyển cảnh canon.
- Game chỉ chấp nhận các thay đổi chỉ số trong giới hạn nhỏ.
- AI không được tạo vật phẩm, năng lực hoặc nhân vật mới để giải quyết tình huống.
- Các thiết lập cũ như Tây viện, Huyết Tử Động, Mẫu Thai và Cao Minh bị cấm trong prompt quản trò.
- Các mốc truyện chính vẫn do `src/story.js` kiểm soát.

## Biến môi trường tùy chọn

```text
GEMINI_MODEL=gemini-3.6-flash
ALLOWED_ORIGINS=https://rabpitvn1-create.github.io,http://localhost:3000
```

`ALLOWED_ORIGINS` chỉ cần khi giao diện và backend nằm ở hai tên miền khác nhau.
