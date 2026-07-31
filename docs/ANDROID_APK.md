# APK Android — Hứa Gia: LIBERA-1899

## Kiến trúc

APK đóng gói toàn bộ giao diện web trong Android WebView. Khi người chơi gửi hành động:

1. JavaScript lập dữ liệu cho model đạo diễn.
2. Kotlin gọi `gemini-3.5-flash-lite` qua Firebase AI Logic để xử lý logic, chỉ số và hậu quả.
3. JavaScript khóa kế hoạch cảnh.
4. Kotlin gọi `gemini-3.6-flash` để viết lời kể, hội thoại và ba lựa chọn.
5. Kết quả được lưu vào bộ nhớ cục bộ của WebView.

APK không cần Vercel và không chứa `GEMINI_API_KEY`.

## Tạo Firebase project

1. Mở Firebase Console và tạo project.
2. Vào **AI Services → AI Logic → Get started**.
3. Chọn **Gemini Developer API**.
4. Đăng ký Android app với package:

```text
com.rabpity.huafamily.debug
```

5. Với bản phát hành sau này, đăng ký thêm:

```text
com.rabpity.huafamily
```

## GitHub Secrets cần thêm

Vào repository → **Settings → Secrets and variables → Actions → New repository secret**.

Thêm các giá trị lấy từ cấu hình Android app trong Firebase:

```text
FIREBASE_API_KEY
FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_STORAGE_BUCKET
```

`FIREBASE_API_KEY` ở đây là Firebase Web API key trong cấu hình project. APK không dùng Gemini API key trực tiếp.

Có thể thêm hai repository variables, nhưng không bắt buộc:

```text
GEMINI_DIRECTOR_MODEL=gemini-3.5-flash-lite
GEMINI_WRITER_MODEL=gemini-3.6-flash
```

## App Check cho APK debug

APK debug dùng App Check Debug Provider. Sau khi cài và mở APK lần đầu:

1. Kết nối điện thoại với `adb logcat` hoặc mở Logcat trong Android Studio.
2. Tìm dòng `DebugAppCheckProvider` chứa debug token.
3. Vào Firebase Console → **Security → App Check → Apps**.
4. Chọn app debug → **Manage debug tokens** → thêm token.

Bản release dùng Play Integrity thay vì debug token.

## Build APK trên GitHub

Workflow `.github/workflows/build-android-apk.yml` chạy khi:

- mở hoặc cập nhật pull request liên quan Android/game;
- merge thay đổi vào `main`;
- bấm **Run workflow** thủ công.

Tải APK:

1. Mở tab **Actions** của repository.
2. Chọn workflow **Build Android APK**.
3. Mở run thành công mới nhất.
4. Trong phần **Artifacts**, tải `HuaGia-LIBERA-1899-debug-apk`.

APK được giữ 30 ngày trong artifact của GitHub Actions.

## Trạng thái khi chưa có Firebase Secrets

GitHub vẫn build được APK, nhưng nút tạo lượt mới sẽ báo:

```text
APK chưa được cấu hình Firebase AI Logic.
```

Sau khi thêm đủ secrets, chạy lại workflow để tạo APK hoạt động qua Internet.
