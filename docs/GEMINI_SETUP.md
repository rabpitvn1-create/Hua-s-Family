# Bật AI quản trò Gemini

Repository đã có sẵn giao diện nhập hành động tự do và backend `api/gemini-turn.js`. Model chính là `gemini-3.6-flash`; khi Google trả lỗi quá tải tạm thời, backend tự thử lại rồi chuyển sang `gemini-3.5-flash-lite`.

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
6. Mở URL Vercel vừa tạo. Giao diện game và `/api/gemini-turn` chạy cùng tên miền nên không cần cấu hình thêm.

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

Repository có workflow `.github/workflows/gemini-smoke-test.yml`.

1. Mở tab **Actions**.
2. Chọn **Kiểm tra Gemini API**.
3. Chọn **Run workflow**.

Workflow tự thử model chính và model dự phòng. Nó chỉ kiểm tra API key/model; không biến GitHub Pages thành backend.

## Xử lý khi Gemini quá tải

Lỗi `503 UNAVAILABLE` hoặc thông báo “This model is currently experiencing high demand” là lỗi công suất tạm thời từ Gemini, không phải lỗi API key hay Vercel.

Backend hiện xử lý theo thứ tự:

1. Gọi `gemini-3.6-flash`.
2. Nếu gặp lỗi tạm thời như `408`, `429` hoặc `5xx`, chờ một khoảng ngắn có jitter rồi thử lại.
3. Nếu model chính vẫn không đáp ứng, chuyển sang `gemini-3.5-flash-lite`.
4. Chỉ báo lỗi cho người chơi sau khi cả model chính và model dự phòng đều thất bại.

## Cách AI được giới hạn

- AI chỉ tạo nhánh phụ trong cảnh hiện tại; không tự chuyển cảnh canon.
- Game chỉ chấp nhận các thay đổi chỉ số trong giới hạn nhỏ.
- AI không được tạo vật phẩm, năng lực hoặc nhân vật mới để giải quyết tình huống.
- Các thiết lập cũ như Tây viện, Huyết Tử Động, Mẫu Thai và Cao Minh bị cấm trong prompt quản trò.
- Các mốc truyện chính vẫn do `src/story.js` kiểm soát.

## Biến môi trường tùy chọn

```text
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
GEMINI_RETRY_ATTEMPTS=2
ALLOWED_ORIGINS=https://rabpitvn1-create.github.io,http://localhost:3000
```

`GEMINI_FALLBACK_MODELS` nhận nhiều model cách nhau bằng dấu phẩy. `GEMINI_RETRY_ATTEMPTS` được giới hạn từ 1 đến 3 lần cho mỗi model. `ALLOWED_ORIGINS` chỉ cần khi giao diện và backend nằm ở hai tên miền khác nhau.
