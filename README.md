# Hứa Gia: LIBERA-1899

Text game AI sandbox đặt trong thế giới Hứa Gia năm 1899. Trò chơi không còn sử dụng chuỗi cảnh hoặc nhánh truyện cố định. Gemini phát triển cốt truyện chính từ hành động của người chơi, còn canon thế giới được khóa trong `src/world-canon.js`.

## Cách vận hành

1. `src/world-canon.js` chứa canon thế giới bất biến và trạng thái khởi tạo.
2. `src/game.js` quản lý trạng thái chiến dịch, bản lưu, vật phẩm, đầu mối và hậu quả.
3. `src/ai-game-master.js` gửi hành động của người chơi đến backend.
4. `api/gemini-turn.js` dùng Gemini để tạo lượt truyện mới theo JSON schema.
5. Mọi sự kiện mới được ghi vào canon của chiến dịch hiện tại, không sửa canon thế giới.

AI có thể tạo NPC, địa điểm, nhiệm vụ và vật phẩm mới khi hợp lý. Vật phẩm quan trọng có thể kèm `imagePrompt` để endpoint ảnh riêng xử lý trong giai đoạn tiếp theo.

## Chạy trên Vercel

Thêm các biến môi trường:

```text
GEMINI_API_KEY=khóa dùng cho cốt truyện
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODELS=gemini-3.5-flash-lite
GEMINI_RETRY_ATTEMPTS=2
```

`GEMINI_IMAGE_API_KEY` có thể được khai báo riêng, nhưng bản này chưa gọi model ảnh.

Sau khi thay đổi biến môi trường, tạo deployment mới. Giao diện và `/api/gemini-turn` chạy cùng tên miền Vercel.

## Chạy cục bộ

Cần Node.js 20 trở lên và Vercel CLI:

```bash
npm install -g vercel
cp .env.example .env.local
vercel dev
```

## Kiểm tra

```bash
npm run check
npm run test:gemini
```

## Cấu trúc chính

```text
index.html
styles.css
ai-styles.css
src/
  app.js
  world-canon.js
  game.js
  ai-game-master.js
api/
  gemini-turn.js
scripts/
  test-gemini.mjs
```

Các file truyện cố định `src/story.js` và `src/encounters.js` đã bị loại bỏ.
