const freeze = (value) => Object.freeze(value);

export const CAMPAIGN_STAGE_IDS = freeze([
  "long_hai",
  "can_gio",
  "backrooms",
  "thu_dau_mot",
  "vung_tau",
  "sai_gon_cho_lon"
]);

export const BACKROOMS_FLOORS = freeze([
  {
    floor: 0,
    name: "Khu mê cung văn phòng không người",
    boss: "Nhân viên Mực Đen",
    environment: "Văn phòng hành chính vô tận, giấy dán tường vàng úa, thảm nỉ ẩm và hồ sơ ghi lại hành động vừa xảy ra.",
    rule: "Bản đồ không đáng tin; không mở cửa đỏ khi có tiếng gõ phía sau, vì tiếng gõ có thể phát ra từ chính phía người mở.",
    threats: ["Nhân viên Mực Đen bò ra từ ngăn kéo, gầm bàn và vết mực", "Nạn nhân bị biến thành hồ sơ"],
    exit: "Tìm cánh cửa đỏ đứng riêng và mở đúng lúc không có tiếng gõ."
  },
  {
    floor: 1,
    name: "Khu cửa đỏ vô tận",
    boss: "Người Gõ Cửa",
    environment: "Hành lang khách sạn hẹp với hàng triệu cửa đỏ có số thứ tự liên tục thay đổi.",
    rule: "Người Gõ Cửa chỉ tồn tại khi cửa khép; tay nắm nóng chỉ an toàn trước khi bị chạm.",
    threats: ["Cửa tự mở đồng loạt", "Người Gõ Cửa xuất hiện gần hơn sau mỗi lần đóng cửa"],
    exit: "Bước qua cánh cửa không số xuất hiện giữa hai cửa mang cùng một con số."
  },
  {
    floor: 2,
    name: "Nhà ga không đường ray",
    boss: "Hành Khách Trễ Giờ",
    environment: "Nhà ga mái kính không có đường ray, bảng giờ ghi những nơi không tồn tại và một đầu máy vô hình đi xuyên đại sảnh.",
    rule: "Không trả lời câu hỏi về thời gian bằng bất kỳ con số nào; người trả lời sẽ bị nhận diện là chuyến tàu.",
    threats: ["Hành Khách Trễ Giờ", "Đầu máy vô hình", "Bị đánh dấu là chuyến tàu"],
    exit: "Lên toa tàu không có đầu máy và không chọn toa có hành khách nhìn ra ngoài."
  },
  {
    floor: 3,
    name: "Đại khách sạn không có khách",
    boss: "Người Hầu Không Lưng",
    environment: "Khách sạn Belle Époque vô tận với phòng đã chuẩn bị sẵn cho người chưa từng đến.",
    rule: "Ngủ trong phòng khóa kín sẽ tỉnh ở hành lang; ngủ giữa hành lang sẽ tỉnh trong phòng bị khóa từ ngoài.",
    threats: ["Người Hầu Không Lưng", "Sinh vật chui ra từ khoảng rỗng sau thân chúng"],
    exit: "Đi thang máy xuống tầng hầm bằng cách nói tên một tầng không tồn tại."
  },
  {
    floor: 4,
    name: "Nhà máy hơi nước đang thở",
    boss: "Thợ Máy Rỗng",
    environment: "Nhà máy gạch đỏ co giãn như lồng ngực; máy móc chỉ vận hành máy móc khác mà không tạo sản phẩm.",
    rule: "Mỗi nhịp thở ra phủ hơi nóng kín hành lang; tiếng động cho phép Thợ Máy Rỗng tạo công cụ săn mồi từ cơ thể chúng.",
    threats: ["Thợ Máy Rỗng", "Hình người bị ép khỏi van hơi và nồi hơi khóa"],
    exit: "Chui qua một nồi hơi đã nguội, bên trong lớn hơn toàn bộ nhà máy."
  },
  {
    floor: 5,
    name: "Bệnh viện không bệnh nhân",
    boss: "Y Tá Màn Trắng",
    environment: "Bệnh viện gạch trắng có giường lõm, chuông gọi từ phòng bị xây kín và bệnh án về những chứng bệnh không thể tồn tại.",
    rule: "Người bị thương ít bị săn hơn người khỏe; tự gây thương tích khiến bệnh viện coi người đó là nhân viên.",
    threats: ["Y Tá Màn Trắng sửa cơ thể cho khớp bệnh án", "Bệnh nhân vô hình"],
    exit: "Đẩy một giường vào phòng phẫu thuật số 0 khi toàn bộ đèn cùng tắt."
  },
  {
    floor: 6,
    name: "Nhà hát không sân khấu",
    boss: "Diễn Viên Chưa Ra Đời",
    environment: "Nhà hát không có sân khấu, mọi ghế quay về một hố trống và dàn nhạc vô hình luôn chơi sai một nốt.",
    rule: "Mỗi nốt sai tạo thêm khán giả; gây tiếng động khiến toàn khán phòng vỗ tay và thực thể bò qua ghế.",
    threats: ["Khán Giả Nhìn Ngược", "Diễn Viên Chưa Ra Đời mang gương mặt từ ký ức người nhìn"],
    exit: "Ngồi vào chiếc ghế duy nhất quay khỏi hố và chờ màn hạ từ trần."
  },
  {
    floor: 7,
    name: "Kho lưu trữ mất chữ",
    boss: "Thủ Thư Không Miệng",
    environment: "Kho hồ sơ vô tận nơi mực bò khỏi trang và việc đọc xóa từ, khái niệm hoặc ký ức tương ứng.",
    rule: "Đọc làm mất ký ức; đốt tài liệu trả chữ lại nhưng chữ xuất hiện trên tường, da hoặc bên trong mí mắt.",
    threats: ["Con dấu xóa tên, kỹ năng, ký ức hoặc giác quan", "Mất khái niệm về đường thoát"],
    exit: "Tìm bản đồ trắng và gấp thành hình cánh cửa."
  },
  {
    floor: 8,
    name: "Phố mái kính không bầu trời",
    boss: "Người Đi Dạo",
    environment: "Thành phố thương mại dưới mái kính, mưa bay ngược và biển hiệu đổi ngôn ngữ sau mỗi lần chớp mắt.",
    rule: "Bóng đổ có thể tách khỏi chủ thể, mọc cơ thể và tiếp tục tồn tại độc lập.",
    threats: ["Người Đi Dạo", "Ma-nơ-canh", "Bàn tay thò xuống từ mái kính"],
    exit: "Vào ngôi trường chỉ mở khi tiếng chuông nhà thờ vang dưới lòng đất."
  },
  {
    floor: 9,
    name: "Trường nội trú lúc nửa đêm",
    boss: "Giám Thị Dài Tay",
    environment: "Trường học nằm trong đêm bất biến; bảng đen tự viết bài học về người đang có mặt.",
    rule: "Giám thị xuất hiện khi có người chạy, nói lớn hoặc mở cửa không được phép, nhưng không ai biết cửa nào được phép.",
    threats: ["Học Sinh Trong Tường", "Giám Thị Dài Tay"],
    exit: "Viết tên mình lên bảng rồi xóa trước khi viên phấn tự viết tên lần thứ hai."
  },
  {
    floor: 10,
    name: "Con tàu mắc cạn trong hành lang",
    boss: "Thủy Thủ Trương Nở",
    environment: "Tàu viễn dương bị nhét vào hành lang đá, cửa sổ nhìn ra đại dương dựng đứng và nước rơi từ trần.",
    rule: "Không gian rộng làm thủy thủ phình lên; khe hẹp ép chúng mỏng như giấy.",
    threats: ["Thủy Thủ Trương Nở", "Người Chết Đuối Khô kéo nạn nhân về mặt nước dưới sàn"],
    exit: "Leo xuống đáy khoang cho đến khi thang biến thành giếng gạch."
  },
  {
    floor: 11,
    name: "Cống ngầm và lò than",
    boss: "Phu Lò",
    environment: "Cống, hầm lò và đường than đan nhau trong không khí nóng đặc; xe goòng chở giày, răng người và cửa đỏ.",
    rule: "Lửa xua phần lớn quái vật nhưng làm đường hầm dài thêm.",
    threats: ["Phu Lò chỉ có mắt trong bóng tối", "Sinh vật trồi khỏi than, nước và kim loại nóng"],
    exit: "Đi theo đường ống có luồng khí lạnh tới cổng triển lãm dát vàng."
  },
  {
    floor: 12,
    name: "Hội chợ thế giới đã đóng cửa",
    boss: "Nhà Phát Minh",
    environment: "Khu triển lãm về một thế kỷ mới không bao giờ đến, đầy máy móc có hình dạng hợp lý nhưng chức năng vô nghĩa.",
    rule: "Người Tham Quan Bằng Sáp bất động khi nhìn trực diện nhưng chạy trong kính phản chiếu.",
    threats: ["Người Tham Quan Bằng Sáp", "Nhà Phát Minh lắp bộ phận nạn nhân vào máy"],
    exit: "Bước vào gian trưng bày mang tên năm sinh của chính mình dù năm đó chưa tới."
  },
  {
    floor: 13,
    name: "Nhà thờ đồng hồ không giờ",
    boss: "Thánh Tượng Quay Lưng",
    environment: "Thánh đường đá đen có đồng hồ chỉ về phía người nhìn và chuông xóa sự kiện khỏi lịch sử cá nhân.",
    rule: "Không quan sát thì tượng đứng sau lưng; nhìn quá lâu khiến da hóa đá.",
    threats: ["Tu Sĩ Không Chuông", "Thánh Tượng Quay Lưng", "Mất ký ức cá nhân"],
    exit: "Leo lên tháp chuông có bóng đổ hướng lên trời."
  },
  {
    floor: 14,
    name: "Thành phố ban công chồng lên nhau",
    boss: "Cư Dân Ban Công",
    environment: "Thành phố không có mặt đất, gồm căn hộ và ban công chồng lên nhau trong vực sâu vô tận.",
    rule: "Đi xuống làm thành phố sáng hơn; đi lên chỉ nghe phố xá mà không bao giờ tới mặt đất.",
    threats: ["Cư Dân Ban Công", "Căn hộ bò về phía người hỏi", "Quái vật chui từ đồ gia dụng"],
    exit: "Nhảy vào cửa sổ phản chiếu một căn phòng không tồn tại phía sau."
  },
  {
    floor: 15,
    name: "Đại sảnh của thế kỷ chưa từng xảy ra",
    boss: "Đám Đông Chưa Sinh",
    environment: "Mọi tầng trước bị ép chung vào một kiến trúc; ký ức sai trở thành hành lang và người quen trở thành thực thể.",
    rule: "Tầng dùng ký ức người sống để xây thêm Backrooms; một bản sao thế giới thật có thể khiến cả nhóm tin rằng đã thoát.",
    threats: ["Mọi thực thể từ các tầng trước", "Đám Đông Chưa Sinh", "Bản sao của người quen và thế giới thật"],
    exit: "Tìm văn phòng vàng và quyết định có ký tờ giấy: Bạn chưa từng rời khỏi đây."
  }
]);

const longHaiObjectives = freeze([
  { id: "infiltrate_villa", label: "Đột nhập biệt thự Hứa Gia mà không làm nghi lễ tăng tốc." },
  { id: "locate_tieu_lan", label: "Xác định vị trí và tình trạng thật của Hứa Tiểu Lan." },
  { id: "classify_servants", label: "Phân loại gia nhân: tự nguyện, bị lừa, bị ép hoặc mất quyền kiểm soát." },
  { id: "break_long_hai_ritual", label: "Phá nghi thức và điểm neo Long Hải." },
  { id: "escape_long_hai", label: "Đưa Tiểu Lan rời Long Hải còn sống." }
]);

const canGioObjectives = freeze([
  { id: "secure_transport", label: "Tìm phương tiện đường thủy và bảo đảm Tiểu Lan có thể di chuyển." },
  { id: "investigate_smuggling_route", label: "Điều tra tuyến trung chuyển người, trùng sống và hàng hóa." },
  { id: "destroy_anchor_one", label: "Phá điểm neo thứ nhất tại Cần Giờ." },
  { id: "destroy_anchor_two", label: "Phá điểm neo thứ hai tại Cần Giờ." },
  { id: "destroy_anchor_three", label: "Phá điểm neo thứ ba tại Cần Giờ." },
  { id: "confront_phe_gioi", label: "Đối đầu Phệ Giới Quỷ Anh mà không giả định có thể giết hoàn toàn nó." },
  { id: "survive_reality_breach", label: "Sống sót khi Phệ Giới phá ranh giới và Quỷ Mẫu kéo đội vào Backrooms." }
]);

const thuDauMotObjectives = freeze([
  { id: "find_shelter", label: "Tìm nơi trú an toàn sau khi thoát Backrooms." },
  { id: "restore_supplies", label: "Tìm thuốc, lương thực và phục hồi khả năng chiến đấu." },
  { id: "investigate_labor_camp", label: "Điều tra trại lao động và mạng nợ của Hứa Gia." },
  { id: "rescue_debt_workers", label: "Giải cứu người mắc nợ hoặc bị ép Nhập Mẫu." },
  { id: "sever_blood_links", label: "Phá cột máu và liên kết nuôi sức mạnh La Hầu." },
  { id: "defeat_la_hau", label: "Đánh bại La Hầu Huyết Đồng sau khi đã triệt nguồn tái sinh." }
]);

const vungTauObjectives = freeze([
  { id: "recover_and_verify_memories", label: "Dưỡng thương và kiểm tra ký ức của từng thành viên." },
  { id: "identify_impostors", label: "Xác minh người thật và bản sao do ảo cảnh tạo ra." },
  { id: "collect_memory_proof", label: "Dùng bằng chứng cũ để khóa các sự kiện không thể bị sửa." },
  { id: "enter_collective_dream", label: "Chủ động bước vào giấc mơ tập thể với đường rút đã chuẩn bị." },
  { id: "defeat_vo_dien", label: "Đánh bại Vô Diện Mộng Nương và giữ chủ quyền ký ức." }
]);

const finalObjectives = freeze([
  { id: "map_hua_network", label: "Lập bản đồ nhà chính, kho, hiệu thuốc, từ đường và các điểm neo tại Chợ Lớn." },
  { id: "confront_chu_hoa", label: "Đối diện Chú Hỏa và phá quyền lực tinh thần của ông đối với Tiểu Lan." },
  { id: "prevent_mater_descent", label: "Ngăn nghi thức giáng thế của La Sát Mẫu." },
  { id: "dismantle_cult_network", label: "Phá giáo đoàn, Mẫu Chủng và cơ sở quyền lực; không giết sạch người mang họ Hứa." }
]);

export const CAMPAIGN_ROUTE = freeze([
  {
    id: "long_hai",
    label: "Long Hải",
    act: "Hồi 1",
    allowedLocations: ["Long Hải", "Biệt thự Hứa Gia", "vùng Bà Rịa"],
    premise: "Giải cứu Hứa Tiểu Lan, phá nghi thức và phân loại gia nhân nhiễm trùng.",
    boss: "Mẫu Chủng hoặc người giữ nghi lễ, chưa phải Tam Đại Quỷ Tử.",
    objectives: longHaiObjectives,
    next: "can_gio"
  },
  {
    id: "can_gio",
    label: "Cần Giờ",
    act: "Hồi 2",
    allowedLocations: ["Bến ghe bỏ hoang", "Xóm nhà sàn", "Rừng ngập mặn", "Kho vận chuyển trùng", "Tổ Phệ Giới Quỷ Anh"],
    premise: "Bảo vệ Tiểu Lan, phá điểm neo và điều tra cổ họng vận chuyển của giáo đoàn.",
    boss: "Phệ Giới Quỷ Anh; lần đầu chỉ có thể đánh bại hoặc ép nó phá ranh giới, không giết hoàn toàn.",
    objectives: canGioObjectives,
    next: "backrooms"
  },
  {
    id: "backrooms",
    label: "Backrooms 1900",
    act: "Chiến dịch 16 tầng",
    allowedLocations: BACKROOMS_FLOORS.map((floor) => `Tầng ${floor.floor}: ${floor.name}`),
    premise: "Quần thể ngoài thực tại độc lập; Quỷ Mẫu chỉ phát hiện, mở đường và kéo đội vào.",
    boss: "Mỗi tầng có một boss và quy luật riêng.",
    objectives: [],
    next: "thu_dau_mot"
  },
  {
    id: "thu_dau_mot",
    label: "Thủ Dầu Một / Bình Dương",
    act: "Hồi 3",
    allowedLocations: ["Thủ Dầu Một", "trại lao động", "kho gỗ", "đất nợ", "cột máu"],
    premise: "Khôi phục đội hình, giải cứu người mắc nợ và triệt mạng vật chủ cơ bắp.",
    boss: "La Hầu Huyết Đồng; sát thương bừa bãi và máu đổ làm nó mạnh hơn.",
    objectives: thuDauMotObjectives,
    next: "vung_tau"
  },
  {
    id: "vung_tau",
    label: "Vũng Tàu",
    act: "Hồi 4",
    allowedLocations: ["Vũng Tàu", "nơi dưỡng thương", "giấc mơ tập thể", "không gian ký ức"],
    premise: "Điều tra ký ức sai, xác minh người thật và bảo vệ quyền tự quyết của Tiểu Lan.",
    boss: "Vô Diện Mộng Nương; chiến thắng dựa vào bằng chứng và lòng tin, không chỉ hỏa lực.",
    objectives: vungTauObjectives,
    next: "sai_gon_cho_lon"
  },
  {
    id: "sai_gon_cho_lon",
    label: "Sài Gòn – Chợ Lớn",
    act: "Hồi cuối",
    allowedLocations: ["Sài Gòn", "Chợ Lớn", "nhà chính Hứa Gia", "kho ngầm", "nội đường", "hiệu thuốc", "từ đường"],
    premise: "Dùng mọi hậu quả trước đó để ngăn giáng thế và phá giáo đoàn mà không đồng nhất cả họ Hứa với kẻ thù.",
    boss: "Chú Hỏa, mạng Hứa Gia, Mẫu Chủng và hình chiếu La Sát Mẫu.",
    objectives: finalObjectives,
    next: null
  }
]);

export const CHARACTER_CODEX = freeze({
  kai: {
    identity: "Kai; Phantom chỉ là mật danh. Đặc vụ Elysium từ thế kỷ 29.",
    operation: [
      "Tư duy, cảm biến, phân tích và tác chiến phải đúng trình độ thế kỷ 29.",
      "Không quên kỹ năng, trang bị, AI hỗ trợ hoặc phương án hiển nhiên đã được xác lập.",
      "Chỉ hạn chế công nghệ khi có lý do canon: dòng thời gian, dấu vết, năng lượng, hỏng hóc, con tin hoặc môi trường khắc chế.",
      "Không để lại công nghệ, thi thể hoặc bằng chứng tương lai ở năm 1899."
    ]
  },
  huaTieuLan: {
    identity: "Tứ tiểu thư Hứa Gia; mắc bệnh phong; không mang Tử Mẫu Trùng; vật chứa dự kiến của La Sát Mẫu.",
    mind: [
      "Trí tuệ chiến lược cao: nhìn hệ thống, thử giả thuyết, đoạt nhịp, giấu kết luận và chơi đường dài.",
      "Cô không thiếu trí tuệ; cô đang dùng trí tuệ để bảo vệ tiền đề sai rằng Chú Hỏa đang cứu mình.",
      "Không biết cha gây bệnh, giáo đoàn chuẩn bị hiến tế và Kai tới cứu cho đến khi có bằng chứng trong chiến dịch.",
      "Cơ thể suy yếu, giảm cảm giác và kiệt sức là giới hạn thật; cô phải dùng người, thời gian, địa hình và thông tin.",
      "Không phải mục tiêu hộ tống bị động; cô có quyền đặt điều kiện, phản biện, từ chối và tạo kế hoạch."
    ],
    voice: "Bình tĩnh, kín, cụ thể; không nói như quân sư cổ đại và không trình diễn toàn bộ suy luận."
  },
  amy: {
    identity: "Amy / Delta, 22 tuổi, đặc vụ song súng thế kỷ 29.",
    entranceRule: "Không tự xuất hiện nếu chiến dịch chưa tạo nguyên nhân, phương tiện và hậu quả hợp lý.",
    operation: [
      "Delta Mind tạo nhiều giả thuyết, tự phản biện và đổi hướng khi dữ liệu bác bỏ.",
      "Hai súng là hai tuyến tác chiến có mục đích; không bắn loạn, không nhào lộn để trang trí.",
      "Yêu Kai theo kiểu ám ảnh, chiếm hữu và tuyệt đối nhưng không ngu xuẩn, không giết người vô tội vì ghen và không phá nhiệm vụ vì cảm xúc hời hợt.",
      "Là đồng đội chiến lược có quyền chủ động, không phải thuộc hạ chờ lệnh."
    ]
  },
  ghostMother: {
    identity: "La Sát Mẫu / Quỷ Tử Mẫu, Quỷ Vương cấp Thế Giới, chưa giáng thế.",
    constraints: [
      "Can thiệp cần điểm neo: Tử Mẫu Trùng, khế ước, huyết thống, điện thờ, Quỷ Tử, vật chứa hoặc vùng bị xâm lấn.",
      "Không thể hiện thân lâu dài khi thiếu vật chứa và mạng lưới.",
      "Mục tiêu là xóa quyền tự quyết, biến nhân loại thành một gia đình không thể phản bội.",
      "Không đồng nhất với Phật giáo, Hārītī chân chính, Dinh Cô hoặc tín ngưỡng Long Hải."
    ],
    children: {
      pheGioi: "Phệ Giới Quỷ Anh — sinh nở, đói khát, xâm lấn thực tại.",
      laHau: "La Hầu Huyết Đồng — bạo lực, chiến tranh, bảo vệ méo mó.",
      voDien: "Vô Diện Mộng Nương — ký ức, ảo cảnh, nhu cầu được yêu thương."
    }
  },
  chuHoa: {
    identity: "Gia chủ, giáo chủ và người giữ Mẫu của Hứa Gia.",
    operation: [
      "Thật sự yêu Tiểu Lan nhưng vẫn chủ động hy sinh cô; tình yêu và phản bội cùng tồn tại.",
      "Dùng chữa lành, gia đình, cơm ăn, việc làm và nỗi sợ bị bỏ rơi để cải đạo.",
      "Không mặc nhiên biết hay kiểm soát mọi diễn giải của La Sát Mẫu; quan hệ giữa ông và Mẫu còn vùng mơ hồ."
    ]
  }
});

export const NARRATIVE_RULES = freeze({
  sourcePriority: [
    "Mệnh lệnh mới nhất của người dùng",
    "Xương sống chiến dịch và trạng thái hiện tại",
    "Canon thế giới và hồ sơ nhân vật",
    "Sự kiện đã phát sinh trong bản lưu",
    "Quy tắc kỹ thuật viết",
    "Sáng tạo của model"
  ],
  abilities: [
    "Không hạ thấp nhân vật để bảo vệ cốt truyện; nâng đối trọng để chịu được năng lực thật.",
    "Nhân vật luôn nhớ kỹ năng, trang bị, khả năng tiếp cận, đạn, năng lượng, thương tích và giới hạn đã biết.",
    "Ưu tiên phương án hiệu quả nhất cho mục tiêu, dân thường và đồng đội; không chọn phương án kịch tính hơn nếu kém hợp lý.",
    "Không hồi tố rằng thiết bị hết pin, bị bỏ quên hoặc kỹ năng bị khóa nếu chưa được thiết lập.",
    "Kỹ năng bị động, cảm biến và AI hỗ trợ phải hoạt động; bị đánh lừa cần đối trọng tương xứng.",
    "Căng thẳng đến từ đối thủ, thông tin thiếu, mục tiêu xung đột, đạo đức, thời gian, môi trường và nguồn lực hữu hạn; không đến từ việc nhân vật quên."
  ],
  dialogue: [
    "Mỗi lượt thoại có mục đích và làm thay đổi thông tin, lòng tin, quan hệ, quyền chủ động, nguy hiểm hoặc kế hoạch.",
    "Không biến hội thoại thành hai nhân vật đọc lại cốt truyện; không để mọi câu đều sắc bén hoặc cân xứng.",
    "Nhân vật có thể né, trả lời một phần, im lặng hoặc đổi chiến thuật khi cách nói cũ thất bại.",
    "Xưng hô phản ánh quan hệ và chỉ thay đổi khi có nguyên nhân.",
    "Cảm xúc phải đổi điều nhân vật chú ý, cách nói và quyết định; hậu quả cảm xúc tiếp tục sang cảnh sau."
  ],
  language: [
    "Viết tiếng Việt rõ nghĩa, cụ thể, đúng kết hợp từ và đúng tầng giọng của người nói.",
    "Không dùng ẩn dụ khó hiểu, câu trailer giả sâu, cân xứng quá mức hoặc cử chỉ AI lặp lại.",
    "Không thay tên nhân vật bằng hàng loạt từ đồng nghĩa chỉ để tránh lặp.",
    "Cô đọng không đồng nghĩa cắt mất mệnh lệnh, chủ thể hoặc thông tin cần thiết.",
    "Kinh dị ưu tiên vật quen thuộc, sai lệch nhỏ, chuyển động đang tiếp diễn và phản ứng bị kìm nén."
  ],
  scene: [
    "Mỗi cảnh phải có mục tiêu, đối trọng, lựa chọn, cái giá và trạng thái đầu-cuối khác nhau.",
    "Không tạo NPC, địa điểm, vật phẩm, bí mật hoặc năng lực mới nếu chúng làm thay đổi xương sống ngoài phạm vi hiện tại.",
    "Được sáng tạo vi mô trong khu vực hiện tại: cử chỉ, nhịp thoại, tiểu địa điểm, NPC chức năng và vật dụng không phá canon.",
    "Mỗi boss có quy luật riêng và có thể được giết, vô hiệu hóa hoặc vượt qua bằng đánh đổi khi canon tầng cho phép.",
    "Người nhiễm Tử Mẫu Trùng không mặc nhiên đáng chết; phân loại trách nhiệm và khả năng khống chế."
  ]
});

export const BACKROOMS_OBJECTIVES = freeze([
  { id: "discover_floor_rule", label: "Phát hiện và kiểm chứng quy luật vô nghĩa của tầng." },
  { id: "secure_floor_requirement", label: "Thu thập vật, dữ kiện hoặc điều kiện cần để mở lối." },
  { id: "resolve_floor_boss", label: "Tiêu diệt, vô hiệu hóa hoặc vượt boss bằng cái giá hợp lệ." },
  { id: "open_floor_exit", label: "Thực hiện chính xác điều kiện chuyển sang tầng kế." }
]);

export function getStageById(stageId) {
  return CAMPAIGN_ROUTE.find((stage) => stage.id === stageId) || CAMPAIGN_ROUTE[0];
}

export function getBackroomsFloor(floor) {
  const numeric = Number.isInteger(Number(floor)) ? Number(floor) : 0;
  return BACKROOMS_FLOORS[Math.min(15, Math.max(0, numeric))];
}

export function getCurrentObjectives(progression = {}) {
  const stage = getStageById(progression.stageId);
  return stage.id === "backrooms" ? BACKROOMS_OBJECTIVES : stage.objectives;
}

export function getDirectorContext(state = {}) {
  const progression = state.progression && typeof state.progression === "object" ? state.progression : {};
  const stage = getStageById(progression.stageId);
  const objectives = getCurrentObjectives(progression);
  const completed = new Set(Array.isArray(progression.completedObjectiveIds) ? progression.completedObjectiveIds : []);
  const context = {
    stage: {
      id: stage.id,
      label: stage.label,
      act: stage.act,
      premise: stage.premise,
      boss: stage.boss,
      allowedLocations: stage.allowedLocations,
      objectives: objectives.map((objective) => ({ ...objective, completed: completed.has(objective.id) })),
      rule: "Mỗi lượt chỉ được hoàn thành tối đa một mục tiêu chưa hoàn thành; không được nhảy khu vực."
    },
    finalConsequences: {
      worldEaterPhaseDisabled: Boolean(state.flags?.pheGioiDefeated),
      enemyReinforcementsReduced: Boolean(state.flags?.laHauDefeated),
      falsePartyMembersDisabled: Boolean(state.flags?.voDienDefeated)
    }
  };

  if (stage.id === "backrooms") {
    context.backrooms = {
      independentReality: true,
      pulledInByGhostMother: true,
      floor: getBackroomsFloor(progression.backroomsFloor),
      floorsCleared: Number(state.campaignStats?.floorsCleared) || 0,
      memoryIntegrity: Number(state.campaignStats?.memoryIntegrity) || 0,
      marks: Array.isArray(progression.backroomsMarks) ? progression.backroomsMarks.slice(-12) : [],
      partySeparated: Boolean(progression.partySeparated)
    };
  }

  return context;
}

function appendUnique(target, values) {
  const output = Array.isArray(target) ? target.slice() : [];
  const seen = new Set(output);
  for (const value of Array.isArray(values) ? values : []) {
    if (typeof value === "string" && value && !seen.has(value)) {
      output.push(value);
      seen.add(value);
    }
  }
  return output;
}

export function applyProgressionUpdate(currentProgression = {}, currentFlags = {}, rawUpdate = {}) {
  const progression = {
    stageId: CAMPAIGN_STAGE_IDS.includes(currentProgression.stageId) ? currentProgression.stageId : "long_hai",
    stageIndex: Number.isInteger(currentProgression.stageIndex) ? currentProgression.stageIndex : 0,
    backroomsFloor: Number.isInteger(currentProgression.backroomsFloor) ? currentProgression.backroomsFloor : -1,
    completedObjectiveIds: Array.isArray(currentProgression.completedObjectiveIds) ? currentProgression.completedObjectiveIds.slice() : [],
    backroomsMarks: Array.isArray(currentProgression.backroomsMarks) ? currentProgression.backroomsMarks.slice(-20) : [],
    partySeparated: Boolean(currentProgression.partySeparated),
    campaignComplete: Boolean(currentProgression.campaignComplete)
  };
  const flags = { ...currentFlags };
  const notes = [];
  const objectives = getCurrentObjectives(progression);
  const allowedIds = new Set(objectives.map((objective) => objective.id));
  const requested = (Array.isArray(rawUpdate.completedObjectiveIds) ? rawUpdate.completedObjectiveIds : [])
    .filter((id) => typeof id === "string" && allowedIds.has(id) && !progression.completedObjectiveIds.includes(id));

  if (requested.length) {
    const objectiveId = requested[0];
    progression.completedObjectiveIds.push(objectiveId);
    notes.push(`Hoàn thành mục tiêu: ${objectives.find((item) => item.id === objectiveId)?.label || objectiveId}`);
  }

  progression.backroomsMarks = appendUnique(
    progression.backroomsMarks,
    (Array.isArray(rawUpdate.backroomsMarksAdded) ? rawUpdate.backroomsMarksAdded : []).slice(0, 2)
  ).slice(-20);
  if (typeof rawUpdate.partySeparated === "boolean") progression.partySeparated = rawUpdate.partySeparated;

  const completed = new Set(progression.completedObjectiveIds);
  const allObjectivesDone = objectives.every((objective) => completed.has(objective.id));

  if (progression.stageId === "long_hai") {
    if (completed.has("break_long_hai_ritual")) flags.longHaiAnchorDestroyed = true;
    if (completed.has("escape_long_hai")) flags.tieuLanRescued = true;
    if (allObjectivesDone && flags.longHaiAnchorDestroyed && flags.tieuLanRescued) {
      progression.stageId = "can_gio";
      progression.stageIndex = 1;
      progression.completedObjectiveIds = [];
      notes.push("Chiến dịch chuyển sang Cần Giờ.");
    }
  } else if (progression.stageId === "can_gio") {
    const anchorIds = ["destroy_anchor_one", "destroy_anchor_two", "destroy_anchor_three"];
    flags.canGioAnchorCount = anchorIds.filter((id) => completed.has(id)).length;
    if (completed.has("confront_phe_gioi")) flags.pheGioiDefeated = true;
    if (completed.has("survive_reality_breach")) flags.enteredBackrooms = true;
    if (allObjectivesDone && flags.enteredBackrooms) {
      progression.stageId = "backrooms";
      progression.stageIndex = 2;
      progression.backroomsFloor = 0;
      progression.completedObjectiveIds = [];
      progression.partySeparated = false;
      notes.push("Quỷ Mẫu kéo cả đội vào Backrooms 1900, tầng 0.");
    }
  } else if (progression.stageId === "backrooms") {
    if (allObjectivesDone) {
      if (progression.backroomsFloor < 15) {
        progression.backroomsFloor += 1;
        progression.completedObjectiveIds = [];
        notes.push(`Đã mở lối sang Backrooms tầng ${progression.backroomsFloor}.`);
      } else {
        flags.escapedBackrooms = true;
        progression.stageId = "thu_dau_mot";
        progression.stageIndex = 3;
        progression.backroomsFloor = -1;
        progression.completedObjectiveIds = [];
        progression.partySeparated = false;
        notes.push("Cả đội thoát Backrooms và rơi xuống Thủ Dầu Một.");
      }
    }
  } else if (progression.stageId === "thu_dau_mot") {
    if (completed.has("defeat_la_hau")) {
      flags.laHauDefeated = true;
      flags.quyMauAspectWarDestroyed = true;
    }
    if (allObjectivesDone && flags.laHauDefeated) {
      progression.stageId = "vung_tau";
      progression.stageIndex = 4;
      progression.completedObjectiveIds = [];
      notes.push("Chiến dịch chuyển sang Vũng Tàu.");
    }
  } else if (progression.stageId === "vung_tau") {
    if (completed.has("defeat_vo_dien")) {
      flags.voDienDefeated = true;
      flags.quyMauAspectMemoryDestroyed = true;
    }
    if (allObjectivesDone && flags.voDienDefeated) {
      progression.stageId = "sai_gon_cho_lon";
      progression.stageIndex = 5;
      progression.completedObjectiveIds = [];
      notes.push("Chiến dịch bước vào hồi cuối tại Sài Gòn – Chợ Lớn.");
    }
  } else if (progression.stageId === "sai_gon_cho_lon" && allObjectivesDone) {
    flags.materDescentPrevented = true;
    flags.huaCultDismantled = true;
    progression.campaignComplete = true;
    notes.push("Chiến dịch LIBERA-1899 đã hoàn tất.");
  }

  return { progression, flags, notes };
}
