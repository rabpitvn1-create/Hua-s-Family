# Hứa Gia: LIBERA-1899

Text game AI sandbox đặt trong thế giới Hứa Gia năm 1899. Bản hiện tại là **APK Android độc lập**: toàn bộ UI, canon, pipeline và schema Gemini được đóng gói trong APK; không còn backend web, GitHub Pages hay Vercel runtime.

## Kiến trúc runtime

1. `src/world-canon.js` chứa canon thế giới bất biến và trạng thái khởi tạo.
2. `src/game.js` quản lý trạng thái chiến dịch, bản lưu, vật phẩm, đầu mối và hậu quả.
3. `src/ai-game-master.js` chỉ chấp nhận cầu nối native Android.
4. `src/native-ai-pipeline.js` dùng các module đóng gói trong `apk-ai/` để tạo prompt, schema và chuẩn hóa state.
5. Kotlin trong `android/app/src/main/java/com/rabpity/huafamily/` gọi Gemini Developer API trực tiếp qua HTTPS bằng API key do người dùng nhập trên thiết bị.
6. `android/app/build.gradle.kts` đóng gói `index.html`, CSS, `src/**`, `apk-ai/**` và `assets/**` vào WebView assets trong APK.

Không có `/api/gemini-turn`, serverless function, web backend hoặc biến môi trường chứa API key ở runtime.

## API key

APK không nhúng sẵn API key. Người dùng nhập Gemini API key sau khi cài đặt; key được lưu mã hóa trên thiết bị bằng Android Keystore. Có thể lưu tối đa 20 key và xoay vòng khi gặp lỗi quota/rate-limit phù hợp.

Model mặc định:

```text
Đạo diễn: gemini-3.5-flash-lite
Viết văn: gemini-3.6-flash
```

Tên model có thể được đặt bằng repository variables `GEMINI_DIRECTOR_MODEL` và `GEMINI_WRITER_MODEL` khi build. API key không đi qua GitHub Actions.

## Kiểm tra

Cần Node.js 20+:

```bash
npm run check
```

Lệnh này kiểm tra cú pháp, integrity UI và guard `standalone APK` để ngăn web deployment/backend legacy quay trở lại.

## Build APK

Workflow duy nhất cho deployment là `.github/workflows/build-android-apk.yml`.

1. Mở tab **Actions**.
2. Chọn **Build Android APK**.
3. Chạy workflow hoặc mở run từ PR/main.
4. Tải artifact `HuaGia-LIBERA-1899-standalone-debug-apk`.

Workflow build APK, sau đó kiểm tra trực tiếp nội dung APK để chắc chắn `index.html`, native AI pipeline và các module `apk-ai/` đã được đóng gói.

## Cấu trúc chính

```text
index.html
src/
  app.js
  world-canon.js
  game.js
  ai-game-master.js
  native-ai-pipeline.js
apk-ai/
  gemini-prompts.js
  gemini-schemas.js
  gemini-state.js
android/
scripts/
  test-ui.mjs
  test-standalone-apk.mjs
```
