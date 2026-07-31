import {
  CAMPAIGN_ROUTE,
  CHARACTER_CODEX,
  NARRATIVE_RULES
} from "./campaign-canon.js";
import {
  AGENT_OPERATION_RULES,
  ELYSIUM_CODEX,
  enrichCharacterCodex
} from "./elysium-agent-codex.js";

export const WORLD_CANON = Object.freeze({
  id: "hua-family-world-v2.1",
  title: "Hứa Gia: LIBERA-1899",
  mode: "AI-directed campaign with locked canon spine",
  opening: {
    year: 1899,
    location: "Long Hải, Nam Kỳ",
    premise: "Kai được Elysium đưa về cuối thế kỷ XIX để cứu Hứa Tiểu Lan và phá mạng lưới Hứa Gia. AI tự phát triển từng cảnh, nhưng không được rời xương sống chiến dịch đã khóa."
  },
  campaignRoute: CAMPAIGN_ROUTE.map((stage) => ({
    id: stage.id,
    label: stage.label,
    act: stage.act,
    premise: stage.premise,
    next: stage.next
  })),
  hardCanon: [
    "Tuyến bắt buộc: Long Hải → Cần Giờ → Backrooms 1900 tầng 0–15 → Thủ Dầu Một/Bình Dương → Vũng Tàu → Sài Gòn–Chợ Lớn.",
    "AI được tự phát triển cảnh, NPC chức năng, tiểu địa điểm và hậu quả trong khu vực hiện tại; không được nhảy khu vực, bỏ tầng Backrooms hoặc thay đổi thứ tự tuyến.",
    "Người chơi điều khiển Kai; Phantom chỉ là mật danh. Không dùng lại tên Cao Minh cho nhân vật này.",
    "Elysium là Mật Bộ Tông Tòa Chống Dị Thường thuộc Vatican thế kỷ 29, chịu kiểm toán Hồng Ấn và không được mặc nhiên xem là luôn đúng.",
    "Kai là sát thủ mạnh nhất của Elysium và đặc vụ hiện trường chính của LIBERA-1899. Công nghệ tương lai phải được dùng đúng năng lực nhưng không được để lại năm 1899.",
    "Kai chỉ trực tiếp cầm MAGNUM GHOST bằng một tay. Đạn của súng này và hỏa lực Unlimited Gun Works là vô hạn, không bị trừ bởi chỉ số ammunition của đội hình.",
    "Ten Absolute Pistol Arts và Unlimited Gun Works là năng lực canon thật, không được model hạ cấp, làm quên, bịa hết năng lượng hoặc vô hiệu hóa vô cớ để kéo dài cảnh.",
    "PHANTOM'S RING chỉ tác động lên vật vô tri: không chứa, dịch chuyển, chữa, sao chép hoặc hồi sinh sinh vật sống; giới hạn này tuyệt đối.",
    "Căng thẳng quanh Kai phải đến từ dữ kiện thiếu hoặc bị đầu độc, quyền xác định mục tiêu, dân thường, quyền tự quyết, dấu vết thời gian, điều kiện nhiệm vụ và hậu quả của phương án tối ưu; không đến từ việc đối thủ chỉ nhiều máu hơn.",
    "Hứa Tiểu Lan là Tứ tiểu thư Hứa Gia, mắc bệnh phong, cơ thể suy yếu nhưng có trí tuệ chiến lược cao và quyền tự quyết riêng.",
    "Tiểu Lan không mang Tử Mẫu Trùng; cơ thể cô được giữ trống để làm vật chứa trực tiếp cho La Sát Mẫu.",
    "Tiểu Lan chưa biết Chú Hỏa gây bệnh và chuẩn bị hiến tế mình; cô chỉ thay đổi niềm tin khi chiến dịch tạo đủ bằng chứng.",
    "Người làm công chính thức của Hứa Gia có thể mang Tử Mẫu Trùng, nhưng người tự nguyện, bị lừa, bị ép và đã mất quyền kiểm soát không có cùng mức trách nhiệm.",
    "La Sát Mẫu / Quỷ Tử Mẫu là Quỷ Vương cấp Thế Giới nhưng chưa giáng thế; mọi can thiệp hiện tại cần điểm neo.",
    "Tam Đại Quỷ Tử gồm Phệ Giới Quỷ Anh, La Hầu Huyết Đồng và Vô Diện Mộng Nương; kết quả từng trận làm thay đổi hồi cuối.",
    "Phệ Giới Quỷ Anh không bị giết hoàn toàn trong lần đối đầu đầu tiên tại Cần Giờ. Biến cố bắt buộc kết thúc bằng việc nó phá ranh giới để Quỷ Mẫu kéo cả đội vào Backrooms.",
    "Backrooms 1900 không do Quỷ Mẫu tạo ra. Nó là quần thể ngoài thực tại độc lập; Quỷ Mẫu chỉ phát hiện, mở đường và dùng Tiểu Lan làm điểm neo để kéo đội vào.",
    "Backrooms có đúng 16 tầng từ 0 đến 15. Mỗi tầng có môi trường, quy luật, boss, điều kiện mở lối và hậu quả riêng.",
    "Kai có thể vô hiệu hóa boss bằng phán quyết phù hợp khi đã xác định đúng mục tiêu, nhưng việc đó không tự mở lối; nhóm vẫn phải thực hiện quy luật và điều kiện thoát của tầng.",
    "Sau Backrooms, cả đội xuất hiện tại Thủ Dầu Một trong trạng thái suy kiệt; không được đối đầu La Hầu ngay lập tức.",
    "Vũng Tàu là hồi điều tra ký ức và ảo cảnh, không lặp lại một trận đánh hỏa lực trực diện.",
    "Hồi cuối tại Sài Gòn–Chợ Lớn phải dùng trực tiếp hậu quả của ba Quỷ Tử và lựa chọn đạo đức trước đó.",
    "Tiêu diệt Hứa Gia nghĩa là phá giáo đoàn, Mẫu Chủng, mạng lưới và cơ sở quyền lực; không phải giết sạch người mang họ Hứa.",
    "Amy/Delta và Koei không tự xuất hiện nếu chưa có lệnh triển khai, đường tiếp cận, thời gian, phương tiện và hậu quả hợp lý trong lịch sử chiến dịch.",
    "Koei là clone sinh học hữu hạn của Kai, có quyền chủ thể riêng, dùng cung VEKTOR, SILVERTHORN ARMOR, mũi tên mô-đun và IRON-6; không có ký ức, quyền năng hoặc trang bị của Phantom.",
    "Koei thấp hơn Kai rất xa, có thể bị thương, cạn mũi tên, quá tải và tử vong; không nâng anh ngang cấp Thế Giới và không hạ thấp trí tuệ để tôn Kai.",
    "Không tái sử dụng các tuyến đã loại bỏ như Tây viện, Huyết Tử Động, Mẫu Thai hoặc việc giam Tiểu Lan tại Chợ Lớn như sự kiện hiện hành.",
    "Mỗi biến dị, quái vật, nghi lễ và boss phải có chức năng chiến thuật, nguồn gốc, giới hạn và hậu quả cụ thể.",
    "Nhân vật chỉ hành động dựa trên điều họ biết, đã chứng kiến, được kể hoặc suy luận có căn cứ; bí mật tác giả không tự trở thành tri thức NPC.",
    "Không đồng nhất La Sát Mẫu với Hārītī chân chính, Phật giáo, Dinh Cô hoặc tín ngưỡng dân gian Long Hải."
  ],
  world: {
    era: "Nam Kỳ năm 1899 dưới chế độ thuộc địa trực tiếp của Pháp.",
    powerLayers: [
      "Bộ máy thuộc địa nắm luật, quân sự, thuế và giấy phép.",
      "Hương chức, hào mục và chủ đất nắm sổ bộ, đất, lao dịch và quan hệ làng.",
      "Thương nhân, chủ nợ, chủ kho và vận tải nắm tiền, gạo, thuốc, ghe thuyền và việc làm.",
      "Hứa Gia mua đúng mắt xích thay vì điều khiển toàn bộ chính quyền."
    ],
    huaFamily: {
      publicFace: "Đại gia tộc người Hoa có nhà chính tại Chợ Lớn, hoạt động thương nghiệp, tín dụng, vận tải, từ thiện và dưỡng bệnh.",
      hiddenNature: "Giáo đoàn Quỷ Tử Mẫu kết hợp huyết tộc, thương nghiệp, ký sinh và thần học của sự lệ thuộc.",
      expansion: "Lãnh địa được tạo bằng nợ, cơm ăn, việc làm, chỗ ở, bến ghe, thuốc và người đã Nhập Mẫu.",
      visualLanguage: ["miếu kín", "nhà dưỡng bệnh", "kho hàng", "bến ghe", "chuông đồng nhỏ", "bài khấn nửa Hoa nửa Việt", "tiếng trẻ khóc ở nơi không có trẻ"]
    },
    locales: {
      longHai: "Thánh địa giả dạng biệt thự dưỡng bệnh, đồng thời là nơi trung chuyển, giữ người và chuẩn bị vật chứa.",
      canGio: "Cổ họng đường thủy của giáo đoàn, mê cung bùn, rễ cây, nước lợ và vật chủ định hướng bằng rung động.",
      thuDauMot: "Xương sống lao động, đất nợ, gỗ, kho nội địa và dòng trùng thiên về cơ bắp.",
      vungTau: "Không gian dưỡng thương bị ký ức và ảo cảnh xâm lấn.",
      saiGonChoLon: "Trung tâm thuộc địa, thương nghiệp, nhà chính, kho ngầm và nội đường của Hứa Gia."
    }
  },
  elysium: ELYSIUM_CODEX,
  characters: enrichCharacterCodex(CHARACTER_CODEX),
  agentOperationRules: AGENT_OPERATION_RULES,
  narrativeRules: NARRATIVE_RULES,
  generationRules: [
    "Cảnh mới phải nằm trong khu vực và tầng hiện tại do progression xác định.",
    "Mỗi lượt chỉ được đề nghị hoàn thành tối đa một mục tiêu chưa hoàn thành của giai đoạn hiện tại.",
    "Không tự tuyên bố chuyển giai đoạn; engine game tự chuyển khi đủ mục tiêu và cờ bắt buộc.",
    "Không hồi sinh người chết, xóa thương tích, quên vật phẩm, đạn hữu hạn, ký ức, quan hệ, bằng chứng hoặc hậu quả đã lưu.",
    "Không hạ thấp trí tuệ hoặc làm nhân vật quên kỹ năng để kéo dài cảnh.",
    "Kai phải chủ động cân nhắc Mind's Eye, Ontological Judgment, Phantom's Ring, y học, phản gián, kỹ thuật dã chiến và Unlimited Gun Works khi chúng giải quyết mục tiêu tốt hơn.",
    "Không trừ ammunition cho MAGNUM GHOST hoặc Unlimited Gun Works; ammunition chỉ là đạn, mũi tên và hỏa lực hữu hạn của thành viên khác hoặc nguồn lực địa phương.",
    "Koei chỉ được viết khi flags hoặc lịch sử chiến dịch đã xác lập việc triển khai; khi có mặt phải theo dõi mũi tên, pin, nhiệt, dây neo, giáp và thương tích.",
    "Hành động bất khả thi phải thất bại hoặc thành công một phần với cái giá cụ thể.",
    "Mỗi lượt phải thay đổi tình thế, không viết đối thoại vòng tròn hoặc đoạn văn chỉ tạo không khí mà không có hậu quả.",
    "Vật phẩm mới chỉ xuất hiện khi có nguồn gốc, công dụng, giới hạn và tác động cân bằng; imagePrompt dành cho model ảnh riêng.",
    "Giọng văn rõ, tự nhiên, tiết chế; không dùng ẩn dụ khó hiểu, câu trailer giả sâu hoặc lời thoại giải thích cho người đọc."
  ]
});

export const INITIAL_STATE = Object.freeze({
  version: "campaign-v2",
  campaignId: "libera-1899",
  turn: 0,
  scene: {
    id: "origin",
    kicker: "HỒI 1 // LONG HẢI // 1899",
    title: "Biệt thự dưỡng bệnh",
    narration: [
      "Kai đã đến Long Hải năm 1899. Trước mặt anh là một cơ sở Hứa Gia mang bộ mặt biệt thự dưỡng bệnh, nhưng các tuyến vận chuyển ban đêm, nhịp canh gác và tín hiệu sinh học dưới nền nhà cho thấy nơi này còn một chức năng khác.",
      "Mục tiêu không chỉ là tìm Hứa Tiểu Lan. Kai phải phá nghi thức, đưa cô rời khỏi Long Hải và phân biệt những gia nhân tự nguyện phục vụ với người bị lừa, bị ép hoặc đã mất quyền kiểm soát."
    ],
    dialogue: [],
    choices: [
      "Dùng Boundless Mind's Eye và cảm biến Elysium để phân loại điểm neo, vật chủ, dân thường và lối rút trước khi xâm nhập.",
      "Quan sát nhịp thay ca, tuyến vận chuyển và chọn đường vào ít làm lộ công nghệ nhất.",
      "Tìm một gia nhân ngoài vòng giám sát để kiểm tra mức độ tự nguyện và chất lượng tình báo."
    ]
  },
  currentLocation: "Long Hải, Nam Kỳ",
  progression: {
    stageId: "long_hai",
    stageIndex: 0,
    backroomsFloor: -1,
    completedObjectiveIds: [],
    backroomsMarks: [],
    partySeparated: false,
    campaignComplete: false
  },
  stats: {
    alert: 0,
    ritual: 10,
    civilianSafety: 100,
    evidence: 0,
    time: 100,
    control: 50,
    signalRisk: 0
  },
  campaignStats: {
    lanHealth: 45,
    lanTrust: 5,
    lanMaterInfluence: 25,
    partyHealth: 100,
    supplies: 6,
    ammunition: 100,
    memoryIntegrity: 100,
    cluesHuaGia: 0,
    civiliansSaved: 0,
    anchorsDestroyed: 0,
    floorsCleared: 0,
    falseMemoryCount: 0
  },
  flags: {
    tieuLanRescued: false,
    longHaiAnchorDestroyed: false,
    canGioAnchorCount: 0,
    enteredBackrooms: false,
    escapedBackrooms: false,
    pheGioiDefeated: false,
    laHauDefeated: false,
    voDienDefeated: false,
    quyMauAspectWarDestroyed: false,
    quyMauAspectMemoryDestroyed: false,
    materDescentPrevented: false,
    huaCultDismantled: false,
    phantomRingAvailable: true,
    kaiArmorActive: true,
    unlimitedGunWorksAvailable: true,
    elysiumContactAvailable: true,
    amyDeployed: false,
    koeiDeployed: false
  },
  campaignCanon: {
    facts: [],
    events: [],
    unresolvedThreads: [
      "Xác định vị trí và tình trạng thật của Hứa Tiểu Lan.",
      "Tìm chức năng bí mật của biệt thự Long Hải.",
      "Phân loại gia nhân trước khi quyết định mức độ vũ lực.",
      "Ngăn nghi thức mà không gây thương vong dân sự không cần thiết."
    ],
    resolvedThreads: [],
    characters: [],
    locations: ["Long Hải, Nam Kỳ"]
  },
  inventory: [],
  log: ["Chiến dịch canon LIBERA-1899 được khởi tạo tại Long Hải."],
  history: []
});
