# Gemini cho AI sandbox

Bản hiện tại dùng Gemini làm đạo diễn cốt truyện chính. Không còn chuỗi cảnh cố định hoặc nhánh phụ quay về `story.js`.

## Vercel

Trong project Vercel, khai báo:

```text
GEMINI_API_KEY=khóa dùng viết truyện
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
GEMINI_RETRY_ATTEMPTS=2
```

Khóa ảnh tách riêng có thể được lưu dưới tên:

```text
GEMINI_IMAGE_API_KEY=khóa dùng tạo ảnh
```

Bản sandbox này mới lưu `imagePrompt` cho vật phẩm; endpoint ảnh sẽ được triển khai riêng. Không dán bất kỳ API key nào vào mã nguồn, README hoặc file phía trình duyệt.

Sau khi thêm hoặc đổi biến môi trường, phải tạo deployment mới.

## Dữ liệu cốt truyện

- `src/world-canon.js`: canon thế giới bất biến và trạng thái mở đầu.
- `src/game.js`: canon chiến dịch, đầu mối, vật phẩm, hậu quả và bản lưu.
- `src/ai-game-master.js`: nhận hành động tự do của người chơi.
- `api/gemini-turn.js`: tạo lượt truyện chính theo schema.

AI được tạo NPC, địa điểm, nhiệm vụ và vật phẩm mới, nhưng chỉ trong canon chiến dịch. AI không được sửa canon thế giới, hồi sinh nhân vật, xóa hậu quả hoặc dùng vật phẩm vô cớ.

## GitHub Pages

GitHub Pages chỉ phục vụ file tĩnh và không thể giữ API key. Bản AI phải chạy trên Vercel hoặc dùng một backend riêng được cấu hình qua `window.HUA_GEMINI_ENDPOINT`.

## Kiểm tra

```bash
npm run check
npm run test:gemini
```
