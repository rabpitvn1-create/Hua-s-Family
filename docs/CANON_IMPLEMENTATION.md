# Canon implementation notes

## Nguồn nhân vật hiện hành

Runtime chỉ có hai nguồn có quyền định nghĩa nhân vật/tổ chức thế kỷ 29:

- `src/active-character-codex.js`: Kai Akechi / Twilight, Iris / ARGUS và Syvial. File này khóa identity, personality, combat, equipment, relationships, voice và action locks của từng người.
- `src/sru-codex.js`: SRU / Special Response Unit, tổ chức mẹ, học thuyết phản ứng hiện trường, cơ cấu chỉ huy và loadout SRU hiện hành của Kai.

`src/campaign-canon.js` chỉ giữ xương sống chiến dịch, Backrooms, objective và quy tắc kể chuyện. Nó không được chứa một character codex song song.

`src/world-canon.js` nối xương sống chiến dịch với hai nguồn hiện hành trên. Không module nào khác được tự tạo kỹ năng, trang bị, tổ chức, tính cách hoặc quan hệ cho Kai, Iris và Syvial.

## Kai Akechi / Twilight

- Đội trưởng SRU, hồ sơ công khai Human, combat tier UR+.
- Loadout hiện hành: `SRU-MK20`, `SRU-SG`.
- Sparda Core: quỷ lực vô hạn, tăng cường thể chất/giác quan, hồi phục và phân tích chiến trường; không tự sinh thanh năng lượng hay phản phệ.
- Devil Trigger: không có trần thời lượng, số lần, cooldown hoặc phản phệ nội tại; Kai giữ lý trí.
- Guilty Crown Override: dừng hoàn toàn thời gian ngoại giới và khai hỏa đúng 24 phát.
- Omnivault Ring: chỉ tác động vật vô tri, Scan/Copy có 3 slot, Restore cooldown đúng 24 giờ cho từng vật phẩm sau lần Restore thành công.
- Tính cách phải theo `KAI_CODEX.personality`, `principles`, `actionLocks` và `voice`; không lấy tính cách từ story/codex cũ.

## Iris / ARGUS

- Scout / Target Eliminator, tổ chức hiện vẫn CHƯA KHÓA.
- Gunslinger hiện trường, dùng đúng Ivory và Ebony.
- Belial Core cung cấp quỷ lực vô hạn nhưng không biến sát thương, tốc độ bắn, độ bền hoặc độ chính xác thành vô hạn.
- Thousandfold Cognition tăng nhận thức/phân tích tới tỷ lệ đã khóa, không tự tăng tốc cơ thể.
- ARGUS Terrain Read dựa trên quan sát trực tiếp, cảm biến giáp và địa hình; không toàn tri, không nhìn xuyên tường, không dùng drone.
- Field Galley và Field MedNet là hỗ trợ thực địa, không phải tạo vật chất hoặc phép chữa lành tức thời.
- Tsundere quanh Kai không được biến thành slapstick, trẻ con hoặc mất năng lực tác chiến.

## Syvial

- Kiếm sĩ siêu nhiên UR+, tổ chức và chức vụ hiện vẫn CHƯA KHÓA.
- GodKiller là đại kiếm cơ khí, không phải súng/gunblade. Syvial vẫn chiến đấu được khi mất kiếm và có khả năng gọi kiếm trở lại.
- Lucifer Core và Devil Trigger không có mana bar, giới hạn số lần, cooldown nội tại hoặc phản phệ do dùng lâu; Syvial giữ lý trí.
- GodKiller Override / Twenty-Four Severance diễn ra trong thời gian dừng hoàn toàn và luôn đúng 24 nhát chém.
- Yandere với Kai không đồng nghĩa sát nhân ngẫu nhiên, tấn công mọi phụ nữ hoặc quên chiến thuật vì ghen.

## Story spine

Tuyến chiến dịch bắt buộc vẫn là:

`Long Hải → Cần Giờ → Backrooms 1900 tầng 0–15 → Thủ Dầu Một/Bình Dương → Vũng Tàu → Sài Gòn–Chợ Lớn`.

Hứa Tiểu Lan, Chú Hỏa, La Sát Mẫu và Tam Đại Quỷ Tử thuộc story/world canon. Các dữ kiện của họ nằm trong `WORLD_CANON.world` và hard canon, không được dùng để mở lại một character codex thế kỷ 29 thứ hai.

Iris và Syvial chỉ được xuất hiện khi state/history đã tạo đường tiếp cận hợp lý. Các trường tổ chức/chức vụ đang CHƯA KHÓA phải tiếp tục để mở.

## Chống hồi sinh canon cũ

- `src/canon-migration.js` loại các flag và text canon legacy trong save cũ trước khi trạng thái được gửi cho Director/Writer.
- `apk-ai/gemini-prompts.js` nhận trực tiếp clean `WORLD_CANON`, `ACTIVE_CHARACTER_PROMPT_CANON` và `SRU_PROMPT_CANON`; không còn blacklist chữa cháy cho một nguồn canon bẩn.
- `scripts/test-canon-migration.mjs` fail preflight nếu runtime lại chứa tên, kỹ năng, loadout hoặc character hook đã bị loại, hoặc nếu nguồn nhân vật không còn trỏ trực tiếp về active codex.
- CSS có thể giữ tên biến/class lịch sử vì đó chỉ là implementation styling; chúng không phải canon, không được đưa vào prompt và không được dùng làm dữ liệu nhân vật.
