# APK Android — Hứa Gia: LIBERA-1899

## Kiến trúc

APK đóng gói toàn bộ giao diện web trong Android WebView. Khi người chơi gửi hành động:

1. JavaScript lập dữ liệu cho model đạo diễn.
2. Kotlin gọi Gemini Developer API trực tiếp qua HTTPS.
3. Model đạo diễn xử lý logic, chỉ số và hậu quả.
4. JavaScript khóa kế hoạch cảnh.
5. Model viết văn tạo lời kể, hội thoại và ba lựa chọn.
6. Kết quả được lưu vào bộ nhớ cục bộ của WebView.

APK không cần Vercel, Firebase hoặc GitHub Secrets chứa API key.

## Nhập nhiều Gemini API key

Khi mở APK lần đầu, màn hình **Cấu hình Gemini API key** tự xuất hiện.

- Dán mỗi API key trên một dòng.
- Có thể dùng dấu phẩy hoặc dấu chấm phẩy để phân cách.
- Tối đa 20 key.
- Danh sách mới thay thế danh sách cũ.
- Key không được đưa vào bản lưu game, WebView, log hoặc repository.

APK mã hóa danh sách key bằng AES-GCM. Khóa mã hóa nằm trong Android Keystore và không thể xuất trực tiếp khỏi thiết bị theo cách thông thường.

Sau mỗi lần gọi thành công, APK chuyển sang key kế tiếp. Khi một key trả lỗi xác thực, quyền truy cập, quota, giới hạn tần suất hoặc lỗi máy chủ tạm thời, APK thử key tiếp theo. Lỗi prompt hoặc model không hợp lệ không bị che bằng việc đổi key.

## Mở lại màn hình cấu hình

Trong APK, chạm vào trạng thái API ở khu vực nhập hành động để mở lại màn hình cấu hình. Có thể thay toàn bộ danh sách hoặc xóa tất cả key.

## Model mặc định

```text
Đạo diễn: gemini-3.5-flash-lite
Viết văn: gemini-3.6-flash
```

Có thể đổi bằng repository variables:

```text
GEMINI_DIRECTOR_MODEL
GEMINI_WRITER_MODEL
```

Model có trong APK chỉ là tên model. API key luôn do người dùng nhập sau khi cài đặt.

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

## Lưu ý bảo mật

Đây là chế độ dùng key cá nhân trên chính thiết bị của người dùng. Không phát hành APK đã chèn sẵn API key. Không gửi key qua email, issue, commit, log hoặc ảnh chụp màn hình. Khi chia sẻ APK, mỗi người tự nhập key của họ.
