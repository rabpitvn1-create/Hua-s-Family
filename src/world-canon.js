export const WORLD_CANON = Object.freeze({
  id: "hua-family-world-v1",
  title: "Hứa Gia: LIBERA-1899",
  opening: {
    year: 1899,
    location: "Long Hải, Nam Kỳ",
    premise: "Kai được Elysium đưa về cuối thế kỷ 19 để can thiệp vào mạng lưới Hứa Gia và bảo vệ Hứa Tiểu Lan, nhưng cách thực hiện không bị khóa vào một tuyến truyện cố định."
  },
  hardCanon: [
    "Người chơi điều khiển Kai; Phantom chỉ là mật danh, không phải tên thật.",
    "Kai là đặc vụ Elysium đến từ thế kỷ 29. Công nghệ tương lai không được để lại năm 1899.",
    "Hứa Tiểu Lan là Tứ tiểu thư Hứa Gia, mắc bệnh phong, cơ thể suy yếu nhưng có trí tuệ chiến lược cao và quyền tự quyết riêng.",
    "Tiểu Lan không mang Tử Mẫu Trùng; cô đang bị chuẩn bị làm vật chứa trực tiếp cho Quỷ Tử Mẫu.",
    "Tiểu Lan chưa biết cha mình đứng sau kế hoạch và vẫn tin Chú Hỏa đang chữa bệnh cho mình cho đến khi có đủ bằng chứng trong chiến dịch.",
    "Người làm công chính thức của Hứa Gia có thể mang Tử Mẫu Trùng, nhưng người bị ép, bị lừa và người tự nguyện không có cùng mức trách nhiệm.",
    "Quỷ Tử Mẫu là thế lực dài hạn. Phá một cơ sở chỉ cắt một chân rết, không tiêu diệt toàn bộ Hứa Gia hay thực thể này.",
    "Amy/Delta và Koei không tự xuất hiện nếu chiến dịch chưa tạo được nguyên nhân hợp lý.",
    "Không tái sử dụng các tuyến đã loại bỏ như Cao Minh, Tây viện, Huyết Tử Động, Mẫu Thai hoặc việc giam Tiểu Lan tại Chợ Lớn như sự kiện hiện hành.",
    "Mỗi biến dị, quái vật hoặc nghi lễ phải có chức năng chiến thuật, nguồn gốc và hậu quả cụ thể.",
    "Hạn chế thương vong dân sự; phải phân loại vật chủ và trách nhiệm trước khi dùng lực sát thương khi tình huống cho phép.",
    "Nhân vật chỉ được hành động dựa trên điều họ thực sự biết. Bí mật dành cho tác giả không tự trở thành kiến thức của NPC."
  ],
  factions: {
    elysium: {
      name: "Elysium",
      role: "Tổ chức thế kỷ 29 điều phối can thiệp thời gian.",
      constraints: ["Bảo toàn dòng thời gian", "Không bỏ lại công nghệ", "Tôn trọng quyền tự quyết của người được bảo hộ"]
    },
    huaFamily: {
      name: "Hứa Gia",
      role: "Mạng lưới gia tộc, kinh tế, tín ngưỡng và cưỡng chế trải rộng ở Nam Kỳ.",
      constraints: ["Không phải mọi thành viên đều biết toàn bộ kế hoạch", "Mỗi cơ sở có quyền lợi và xung đột địa phương riêng"]
    },
    ghostMother: {
      name: "Quỷ Tử Mẫu",
      aliases: ["La Sát Mẫu", "Quỷ Mẫu"],
      role: "Thực thể đứng sau mạng ký sinh, nghi lễ và các đứa con hoạt động ở nhiều địa phương.",
      constraints: ["Không lộ toàn bộ bản chất quá sớm", "Không bị giải quyết bằng một trận đánh đơn lẻ"]
    }
  },
  characters: {
    kai: {
      name: "Kai",
      alias: "Phantom",
      role: "Nhân vật người chơi, đặc vụ Elysium",
      fixedTraits: ["Kỷ luật", "Có công nghệ thế kỷ 29 nhưng bị giới hạn bởi nhiệm vụ", "Không được tước quyền tự quyết của người khác chỉ vì mục tiêu thuận tiện"]
    },
    huaTieuLan: {
      name: "Hứa Tiểu Lan",
      role: "Tứ tiểu thư Hứa Gia",
      fixedTraits: ["Suy yếu vì bệnh phong", "Thông minh chiến lược", "Không tin người lạ ngay", "Không nói như quân sư cổ đại", "Không phải phần thưởng bị động"]
    }
  },
  generationRules: [
    "AI được tự tạo cốt truyện, địa điểm, NPC, nhiệm vụ và vật phẩm thuộc canon chiến dịch.",
    "Nội dung phát sinh không được sửa hard canon.",
    "Mỗi lượt phải thay đổi tình thế bằng hành động, phát hiện, cái giá hoặc hậu quả; không viết đối thoại vòng tròn.",
    "Không dùng cứu viện bất ngờ, năng lực mới hoặc vật phẩm vô cớ để giải quyết tình huống.",
    "Vật phẩm mới phải có nguồn gốc, giới hạn và công dụng cụ thể; vật phẩm quan trọng có thể kèm imagePrompt nhưng model kể chuyện không tự tạo ảnh.",
    "Câu chuyện có thể rời Long Hải và phát triển tự do, nhưng hậu quả cũ phải được ghi nhớ và tiếp tục tác động."
  ]
});

export const INITIAL_STATE = Object.freeze({
  version: "sandbox-v1",
  campaignId: "libera-1899",
  turn: 0,
  scene: {
    id: "origin",
    kicker: "LONG HẢI // 1899",
    title: "Dòng thời gian chưa được viết",
    narration: [
      "Kai đã đến Long Hải năm 1899. Elysium chỉ khóa những sự thật nền của thế giới; từ thời điểm này, không còn một chuỗi cảnh định sẵn buộc anh phải đi theo.",
      "Hứa Gia vẫn vận hành trong bóng tối, Hứa Tiểu Lan vẫn ở trong vùng nguy hiểm và Quỷ Tử Mẫu vẫn chưa lộ toàn bộ hình dạng. Hành động đầu tiên của người chơi sẽ xác lập hướng phát triển của chiến dịch."
    ],
    dialogue: [],
    choices: [
      "Quan sát khu vực Long Hải trước khi tiếp cận bất kỳ ai.",
      "Tìm một đầu mối về Hứa Tiểu Lan mà không để Hứa Gia phát hiện.",
      "Chủ động tạo một kế hoạch hoàn toàn khác cho nhiệm vụ."
    ]
  },
  currentLocation: "Long Hải, Nam Kỳ",
  stats: {
    alert: 0,
    ritual: 10,
    civilianSafety: 100,
    evidence: 0,
    time: 100,
    control: 50,
    signalRisk: 0
  },
  flags: {
    route: "Tự do",
    contactStarted: false
  },
  campaignCanon: {
    facts: [],
    events: [],
    unresolvedThreads: [
      "Xác định tình trạng hiện tại của Hứa Tiểu Lan.",
      "Tìm cấu trúc hoạt động của Hứa Gia tại Long Hải.",
      "Ngăn nghi lễ mà không gây thương vong dân sự không cần thiết."
    ],
    resolvedThreads: [],
    characters: [],
    locations: ["Long Hải, Nam Kỳ"]
  },
  inventory: [],
  log: ["Chiến dịch AI sandbox LIBERA-1899 được khởi tạo."],
  history: []
});
