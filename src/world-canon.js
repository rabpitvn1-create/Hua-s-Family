import {
  CAMPAIGN_ROUTE,
  NARRATIVE_RULES
} from "./campaign-canon.js";
import {
  ACTIVE_CHARACTER_CODEX,
  KAI_CODEX,
  IRIS_CODEX,
  SYVIAL_CODEX
} from "./active-character-codex.js";
import { SRU_CODEX } from "./sru-codex.js";

export const WORLD_CANON = Object.freeze({
  id: "hua-family-world-v3",
  title: "Hứa Gia: LIBERA-1899",
  mode: "AI-directed campaign with locked canon spine",
  opening: {
    year: 1899,
    location: "Long Hải, Nam Kỳ",
    premise: "Kai Akechi / Twilight đang hoạt động tại Long Hải năm 1899 để cứu Hứa Tiểu Lan và phá mạng lưới Hứa Gia. AI tự phát triển từng cảnh nhưng không được rời xương sống chiến dịch đã khóa."
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
    "Nguồn duy nhất cho kỹ năng, trang bị, tính cách, quan hệ và giới hạn của Kai, Iris, Syvial là active-character-codex.js; nguồn tổ chức hiện hành của Kai là sru-codex.js.",
    "Người chơi điều khiển Kai Akechi / Twilight, Đội trưởng SRU. Hồ sơ công khai của Kai ghi Human; bản chất và huyết thống thật chỉ được NPC biết khi có nguồn thông tin hợp lệ.",
    "Kai dùng SRU-MK20 và SRU-SG theo loadout hiện hành. Omnivault Ring chỉ tác động lên vật vô tri; Scan/Copy có 3 slot và Restore có cooldown đúng 24 giờ tính riêng cho từng vật phẩm sau lần Restore thành công.",
    "Sparda Core cung cấp quỷ lực vô hạn, tăng cường thể chất, giác quan, hồi phục và phân tích chiến trường. Không tự phát sinh thanh năng lượng, giới hạn sử dụng hoặc phản phệ để kéo dài cảnh.",
    "Devil Trigger của Kai không có trần thời lượng, số lần kích hoạt, cooldown hay phản phệ nội tại; Kai giữ nguyên ý thức, ký ức, tính cách và phán đoán.",
    "Guilty Crown Override kích hoạt Devil Trigger, dừng hoàn toàn thời gian ngoại giới và khai hỏa đúng 24 phát trước khi dòng thời gian được trả lại.",
    "Iris / ARGUS là scout-markswoman hiện trường, dùng đúng Ivory và Ebony. ARGUS Terrain Read không toàn tri, không nhìn xuyên tường và không dùng drone; Thousandfold Cognition tăng nhận thức/phân tích chứ không tự tăng tốc cơ thể.",
    "Belial Core của Iris cung cấp quỷ lực vô hạn nhưng không đồng nghĩa sát thương, tốc độ bắn, độ bền hoặc độ chính xác vô hạn. Field Galley và Field MedNet là hỗ trợ thực địa, không phải tạo vật chất hay chữa lành tức thời.",
    "Iris quyết đoán, bình tĩnh, sắc, dũng cảm, nữ tính và tử tế. Tsundere quanh Kai không được biến thành bạo lực slapstick, trẻ con hoặc mất năng lực tác chiến.",
    "Syvial là kiếm sĩ siêu nhiên UR+ dùng GodKiller và Lucifer Armor. GodKiller là đại kiếm cơ khí, không phải súng hay gunblade; cô vẫn chiến đấu được khi mất kiếm và có khả năng gọi kiếm trở lại.",
    "Lucifer Core và Devil Trigger của Syvial không có thanh mana, giới hạn số lần, cooldown nội tại hoặc phản phệ do dùng lâu; Syvial giữ lý trí.",
    "GodKiller Override / Twenty-Four Severance diễn ra trong thời gian dừng hoàn toàn và luôn gồm đúng 24 nhát chém.",
    "Syvial có tình cảm yandere rất mạnh với Kai nhưng không phải sát nhân ngẫu nhiên, không tự tấn công mọi phụ nữ nói chuyện với Kai và không để ghen tuông xóa kỹ năng chiến thuật hoặc trí thông minh.",
    "Iris và Syvial chỉ xuất hiện khi trạng thái hoặc lịch sử chiến dịch đã xác lập sự có mặt hay đường tiếp cận hợp lý. Không tự gán tổ chức hoặc chức vụ cho trường đang CHƯA KHÓA.",
    "Căng thẳng quanh nhân vật mạnh phải đến từ dữ kiện thiếu hoặc bị đầu độc, quyền xác định mục tiêu, dân thường, quyền tự quyết, điều kiện nhiệm vụ, quy luật dị thường và hậu quả của phương án tối ưu; không đến từ việc nhân vật tự quên năng lực.",
    "Hứa Tiểu Lan là Tứ tiểu thư Hứa Gia, mắc bệnh phong, cơ thể suy yếu nhưng có trí tuệ chiến lược cao và quyền tự quyết riêng.",
    "Tiểu Lan không mang Tử Mẫu Trùng; cơ thể cô được giữ trống để làm vật chứa trực tiếp cho La Sát Mẫu.",
    "Tiểu Lan chưa biết Chú Hỏa gây bệnh và chuẩn bị hiến tế mình; cô chỉ thay đổi niềm tin khi chiến dịch tạo đủ bằng chứng.",
    "Người làm công chính thức của Hứa Gia có thể mang Tử Mẫu Trùng, nhưng người tự nguyện, bị lừa, bị ép và đã mất quyền kiểm soát không có cùng mức trách nhiệm.",
    "La Sát Mẫu / Quỷ Tử Mẫu là Quỷ Vương cấp Thế Giới nhưng chưa giáng thế; mọi can thiệp hiện tại cần điểm neo.",
    "Tam Đại Quỷ Tử gồm Phệ Giới Quỷ Anh, La Hầu Huyết Đồng và Vô Diện Mộng Nương; kết quả từng trận làm thay đổi hồi cuối.",
    "Phệ Giới Quỷ Anh không bị giết hoàn toàn trong lần đối đầu đầu tiên tại Cần Giờ. Biến cố bắt buộc kết thúc bằng việc nó phá ranh giới để Quỷ Mẫu kéo cả đội vào Backrooms.",
    "Backrooms 1900 không do Quỷ Mẫu tạo ra. Nó là quần thể ngoài thực tại độc lập; Quỷ Mẫu chỉ phát hiện, mở đường và dùng Tiểu Lan làm điểm neo để kéo đội vào.",
    "Backrooms có đúng 16 tầng từ 0 đến 15. Mỗi tầng có môi trường, quy luật, boss, điều kiện mở lối và hậu quả riêng.",
    "Vô hiệu hóa boss không tự mở lối; nhóm vẫn phải thực hiện quy luật và điều kiện thoát của tầng.",
    "Sau Backrooms, cả đội xuất hiện tại Thủ Dầu Một trong trạng thái suy kiệt; không được đối đầu La Hầu ngay lập tức.",
    "Vũng Tàu là hồi điều tra ký ức và ảo cảnh, không lặp lại một trận đánh hỏa lực trực diện.",
    "Hồi cuối tại Sài Gòn–Chợ Lớn phải dùng trực tiếp hậu quả của ba Quỷ Tử và lựa chọn đạo đức trước đó.",
    "Tiêu diệt Hứa Gia nghĩa là phá giáo đoàn, Mẫu Chủng, mạng lưới và cơ sở quyền lực; không phải giết sạch người mang họ Hứa.",
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
    },
    storyCharacters: {
      huaTieuLan: {
        identity: "Tứ tiểu thư Hứa Gia; mắc bệnh phong; không mang Tử Mẫu Trùng; vật chứa dự kiến của La Sát Mẫu.",
        mind: [
          "Trí tuệ chiến lược cao; nhìn hệ thống, thử giả thuyết, giấu kết luận và chơi đường dài.",
          "Không biết cha gây bệnh, giáo đoàn chuẩn bị hiến tế và Kai tới cứu cho đến khi có bằng chứng trong chiến dịch.",
          "Không phải mục tiêu hộ tống bị động; cô có quyền đặt điều kiện, phản biện, từ chối và tạo kế hoạch."
        ],
        voice: "Bình tĩnh, kín, cụ thể; không trình diễn toàn bộ suy luận."
      },
      ghostMother: {
        identity: "La Sát Mẫu / Quỷ Tử Mẫu, Quỷ Vương cấp Thế Giới, chưa giáng thế.",
        constraints: [
          "Can thiệp cần điểm neo: Tử Mẫu Trùng, khế ước, huyết thống, điện thờ, Quỷ Tử, vật chứa hoặc vùng bị xâm lấn.",
          "Không thể hiện thân lâu dài khi thiếu vật chứa và mạng lưới.",
          "Mục tiêu là xóa quyền tự quyết, biến nhân loại thành một gia đình không thể phản bội."
        ]
      },
      chuHoa: {
        identity: "Gia chủ, giáo chủ và người giữ Mẫu của Hứa Gia.",
        operation: [
          "Thật sự yêu Tiểu Lan nhưng vẫn chủ động hy sinh cô; tình yêu và phản bội cùng tồn tại.",
          "Dùng chữa lành, gia đình, cơm ăn, việc làm và nỗi sợ bị bỏ rơi để cải đạo.",
          "Không mặc nhiên biết hay kiểm soát mọi diễn giải của La Sát Mẫu."
        ]
      }
    }
  },
  organizations: Object.freeze({ sru: SRU_CODEX }),
  characters: ACTIVE_CHARACTER_CODEX,
  agentOperationRules: Object.freeze([
    ...SRU_CODEX.doctrine,
    ...KAI_CODEX.actionLocks
  ]),
  narrativeRules: NARRATIVE_RULES,
  generationRules: [
    "Cảnh mới phải nằm trong khu vực và tầng hiện tại do progression xác định.",
    "Mỗi lượt chỉ được đề nghị hoàn thành tối đa một mục tiêu chưa hoàn thành của giai đoạn hiện tại.",
    "Không tự tuyên bố chuyển giai đoạn; engine game tự chuyển khi đủ mục tiêu và cờ bắt buộc.",
    "Không hồi sinh người chết, xóa thương tích, quên vật phẩm, ký ức, quan hệ, bằng chứng hoặc hậu quả đã lưu.",
    "Mọi kỹ năng, trang bị, tính cách, quan hệ và giới hạn của Kai, Iris, Syvial phải lấy trực tiếp từ active-character-codex.js; không tự điền dữ kiện từ bản build cũ.",
    "Kai phải vận hành đúng Sparda Core, Devil Trigger, Guilty Crown Override, SRU-MK20, SRU-SG và Omnivault Ring với đúng giới hạn hiện hành khi chúng thực sự phù hợp tình huống.",
    "Iris phải vận hành đúng Gunslinger, Ivory/Ebony, Belial Core, Thousandfold Cognition, ARGUS Terrain Read, Field Galley và Field MedNet; không biến cô thành trạm tình báo từ xa.",
    "Syvial phải vận hành đúng GodKiller, Lucifer Armor, Lucifer Core, Devil Trigger và Twenty-Four Severance; không biến ghen tuông thành mất lý trí hay quên chiến thuật.",
    "Iris và Syvial chỉ được đưa vào cảnh khi trạng thái hoặc lịch sử chiến dịch tạo đường tiếp cận hợp lý; không tự gán tổ chức hoặc chức vụ đang chưa khóa.",
    "Hành động bất khả thi phải thất bại hoặc thành công một phần với cái giá cụ thể.",
    "Mỗi lượt phải thay đổi tình thế, không viết đối thoại vòng tròn hoặc đoạn văn chỉ tạo không khí mà không có hậu quả.",
    "Vật phẩm mới chỉ xuất hiện khi có nguồn gốc, công dụng, giới hạn và tác động cân bằng; imagePrompt dành cho model ảnh riêng.",
    "Giọng văn rõ, tự nhiên, tiết chế; không dùng ẩn dụ khó hiểu, câu trailer giả sâu hoặc lời thoại giải thích cho người đọc."
  ],
  characterAuthority: Object.freeze({
    kai: KAI_CODEX.source,
    iris: IRIS_CODEX.source,
    syvial: SYVIAL_CODEX.source,
    organization: SRU_CODEX.id
  })
});

export const INITIAL_STATE = Object.freeze({
  version: "campaign-v3",
  campaignId: "libera-1899",
  turn: 0,
  scene: {
    id: "origin",
    kicker: "HỒI 1 // LONG HẢI // 1899",
    title: "Biệt thự dưỡng bệnh",
    narration: [
      "Kai Akechi, mật danh Twilight, đã có mặt tại Long Hải năm 1899. Trước mặt anh là một cơ sở Hứa Gia mang bộ mặt biệt thự dưỡng bệnh, nhưng các tuyến vận chuyển ban đêm, nhịp canh gác và dấu hiệu dị thường dưới nền nhà cho thấy nơi này còn một chức năng khác.",
      "Mục tiêu không chỉ là tìm Hứa Tiểu Lan. Kai phải phá nghi thức, đưa cô rời khỏi Long Hải và phân biệt những gia nhân tự nguyện phục vụ với người bị lừa, bị ép hoặc đã mất quyền kiểm soát."
    ],
    dialogue: [],
    choices: [
      "Dùng cảm nhận dị thường và khả năng phân tích chiến trường của Sparda Core để phân loại điểm neo, vật chủ, dân thường và lối rút trước khi xâm nhập.",
      "Giữ đúng học thuyết SRU: quan sát nhịp thay ca, khóa đường rút an toàn rồi chọn tuyến vào ít làm lộ công nghệ nhất.",
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
    sruMk20Active: true
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
    characters: ["Kai Akechi / Twilight"],
    locations: ["Long Hải, Nam Kỳ"]
  },
  inventory: [],
  log: ["Chiến dịch canon LIBERA-1899 được khởi tạo tại Long Hải với hồ sơ nhân vật hiện hành."],
  history: []
});
