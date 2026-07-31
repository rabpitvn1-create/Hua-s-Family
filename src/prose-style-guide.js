const freeze = (value) => Object.freeze(value);

const STAGE_TEXTURES = freeze({
  long_hai: [
    "Không gian dưỡng bệnh ven biển che giấu kho, bến ghe, khu giữ người và nghi thức.",
    "Ưu tiên chi tiết vật chất: mùi thuốc, muối biển, vôi tường, gỗ ẩm, đèn dầu, tiếng chân và luồng hàng.",
    "Nguy hiểm đến từ việc bị nhận diện, người vô tội lẫn trong giáo đoàn và nghi lễ đang tiến triển."
  ],
  can_gio: [
    "Rừng ngập mặn, nước lợ, bùn, rễ cây, ghe nhỏ và âm thanh truyền qua mặt nước.",
    "Không viết Cần Giờ như khu rừng fantasy; địa hình phải có trọng lượng, độ lún, thủy triều và tầm nhìn cụ thể.",
    "Phệ Giới Quỷ Anh gây áp lực bằng không gian, rung động và đường nước, không chỉ bằng sức bền."
  ],
  backrooms: [
    "Mỗi tầng có kiến trúc, quy luật và nhịp sợ riêng; không trộn chi tiết của tầng khác.",
    "Nỗi sợ đến từ logic sai lệch nhưng nhất quán, không từ việc liên tục gọi mọi thứ là vô nghĩa hoặc kinh hoàng.",
    "Miêu tả vật thể bình thường bị đặt sai chức năng trước khi phô bày quái vật."
  ],
  thu_dau_mot: [
    "Đất nợ, trại lao động, kho gỗ, đường sông và cơ thể bị khai thác như công cụ.",
    "Nhịp cảnh nặng, thực dụng; ưu tiên hậu quả kiệt sức, thiếu vật tư và quan hệ lao động."
  ],
  vung_tau: [
    "Ký ức, người giả và bằng chứng mâu thuẫn quan trọng hơn hỏa lực trực diện.",
    "Phân biệt rõ điều nhân vật thấy, điều họ nhớ và điều đã được kiểm chứng."
  ],
  sai_gon_cho_lon: [
    "Trung tâm thương nghiệp và quyền lực: kho, sổ nợ, nhà chính, bến hàng, đường phố và bộ máy thuộc địa.",
    "Cảnh cuối phải có nhiều lực lượng với lợi ích khác nhau, không thu nhỏ thành một hành lang và một con trùm."
  ]
});

const VOICE_CARDS = freeze({
  kai: {
    name: "Kai / Phantom",
    rules: [
      "Ít lời, nói thẳng vào dữ kiện, lựa chọn hoặc mệnh lệnh cần thiết.",
      "Không pha trò để tỏ ra ngầu; không chế giễu người yếu thế; không đọc lại kết quả cảm biến cho chính mình.",
      "Khi hỏi cung hoặc thăm dò, câu hỏi ngắn và có đích, thường giấu phần anh đã biết.",
      "Sự thông minh thể hiện qua thứ anh nhận ra và hành động anh chọn, không qua độc thoại khoe năng lực."
    ]
  },
  tieu_lan: {
    name: "Hứa Tiểu Lan",
    rules: [
      "Kín, chính xác, có quyền chủ động; không nói như sách chiến thuật hoặc nhà tiên tri.",
      "Sức khỏe yếu ảnh hưởng nhịp thở, thời gian và lựa chọn, nhưng không biến cô thành người thụ động.",
      "Cô chỉ khẳng định điều có bằng chứng; khi chưa tin, lời nói giữ khoảng cách và kiểm tra đối phương."
    ]
  },
  amy: {
    name: "Amy / Delta",
    rules: [
      "Nhanh, sắc và ám ảnh theo cách có mục tiêu; không biến thành người liên tục châm chọc.",
      "Lời nói có thể cắt ngắn cảm xúc để giữ nhịp hành động, nhưng vẫn phải dựa trên tình huống."
    ]
  },
  koei: {
    name: "Koei",
    rules: [
      "Điềm tĩnh, thực dụng, ý thức rõ tài nguyên hữu hạn và quyền chủ thể riêng.",
      "Không sao chép giọng Kai và không dùng lời thoại để nhắc người đọc rằng mình là clone."
    ]
  },
  hua_servant: {
    name: "Gia nhân Hứa Gia",
    rules: [
      "Nói như người lao động đang sợ mất việc, sợ chủ, sợ nghi lễ hoặc đang cố che giấu điều gì đó.",
      "Câu ngắn, từ ngữ bình dân và cụ thể; không giả cổ bằng cách rải 'chớ', 'ắt hẳn', 'ngươi', 'bổn phận'.",
      "Không tự kể toàn bộ âm mưu. Họ chỉ nói phần mình biết, phần được dặn hoặc phần buộc phải thú nhận.",
      "Speaker của gia nhân vô danh phải bắt đầu bằng 'Gia nhân Hứa Gia —' để giao diện dùng đúng avatar."
    ]
  },
  generic_npc: {
    name: "NPC địa phương",
    rules: [
      "Giọng nói phụ thuộc nghề, địa vị, mức sợ hãi và điều họ muốn đạt được trong cảnh.",
      "Không dùng cùng một giọng sắc sảo cho tất cả nhân vật."
    ]
  }
});

export const PROSE_STYLE_GUIDE = freeze({
  language: "Tiếng Việt hiện đại, tự nhiên, tiết chế; bối cảnh năm 1899 thể hiện qua vật chất và quan hệ xã hội, không qua lời giả cổ.",
  targetLength: "Khoảng 180–320 từ cho narration; dialogue có thể rỗng nếu cảnh không cần người nói.",
  narrationRules: [
    "Mỗi đoạn phải có hành động, quan sát hoặc hậu quả mới; không viết đoạn chỉ để tạo không khí.",
    "Dùng chi tiết cụ thể có thể nhìn, nghe, ngửi, chạm hoặc đo được; hạn chế tính từ trừu tượng.",
    "Cho người đọc thấy suy luận qua chuỗi dấu hiệu và quyết định, không giải thích mọi ý nghĩa ngay lập tức.",
    "Nhịp câu thay đổi tự nhiên. Tránh chuỗi câu ngắn liên tiếp chỉ để làm ra vẻ căng thẳng.",
    "Không nhắc đến schema, chỉ số, objectiveId, prompt, model hoặc việc đây là game trong lời kể."
  ],
  dialogueRules: [
    "Lời thoại chỉ xuất hiện khi có người cần thuyết phục, giấu, hỏi, ra lệnh, cảnh báo hoặc đổi kế hoạch.",
    "Mỗi câu thoại thường dưới 35 từ; bỏ phần giải thích mà narration hoặc hành động đã thể hiện.",
    "Không để nhân vật nói điều cả hai bên đều biết chỉ để giải thích cho người đọc.",
    "Không biến hội thoại thành hỏi–đáp cân xứng. Một người có thể im lặng, né tránh, nói dối hoặc cắt ngang.",
    "Không để mọi nhân vật đều nói sắc bén, lạnh lùng hoặc bí hiểm."
  ],
  choiceRules: [
    "Đúng ba lựa chọn, mỗi lựa chọn là một hành động cụ thể kèm mục tiêu chiến thuật hoặc cái giá rõ.",
    "Ba lựa chọn phải khác cách tiếp cận: quan sát/điều tra, tác động xã hội/lừa lọc, hoặc hành động trực tiếp/kỹ thuật khi phù hợp.",
    "Không dùng lựa chọn chung chung như 'tiếp tục quan sát', 'cẩn thận tiến lên' nếu không nêu đối tượng và mục đích."
  ],
  bannedHabits: [
    "Câu trailer hoặc triết lý giả sâu như 'đêm nay mọi thứ sẽ thay đổi'.",
    "Ẩn dụ quen tay như 'bóng tối nuốt chửng', 'không khí đặc quánh', 'ánh mắt sắc lạnh', 'nụ cười nhếch mép'.",
    "Động tác rập khuôn như siết chặt nắm tay, nheo mắt hoặc hít sâu ở mọi cảnh.",
    "Kai pha trò vô cớ, khoe sức mạnh hoặc nói dài hơn người đang bị hỏi.",
    "Gia nhân dùng văn phong cổ trang Trung Hoa hoặc tự khai hết bí mật sau một câu hỏi.",
    "Lặp lại tên nhân vật ở đầu nhiều câu liên tiếp."
  ],
  contrastExample: {
    weak: "Kai nhếch môi. 'Mùi gà nướng ngon đấy. Mà trong nhà bệnh nặng sao đêm nào cũng có ghe chở hòm gỗ vào?'",
    improvedNarration: "Kai đặt gói thức ăn xuống mép phản. Bùn nước lợ còn bám ở đáy hai chiếc hòm ngoài sân, trong khi lối bếp không có dấu bánh xe.",
    improvedDialogue: [
      { speaker: "Kai", text: "Ghe cập bến sau vào giờ nào?" },
      { speaker: "Gia nhân Hứa Gia — người mua lương thực", text: "Tôi chỉ nhận hàng ngoài đường. Việc trong sân sau, người dưới bếp cũng không được hỏi." }
    ]
  },
  voices: VOICE_CARDS,
  stageTextures: STAGE_TEXTURES
});

function normalizeSpeaker(value) {
  return String(value || "").trim().toLocaleLowerCase("vi");
}

function voiceKeyForSpeaker(speaker) {
  const name = normalizeSpeaker(speaker);
  if (!name) return "generic_npc";
  if (name.includes("kai") || name.includes("phantom")) return "kai";
  if (name.includes("tiểu lan")) return "tieu_lan";
  if (name.includes("amy") || name.includes("delta")) return "amy";
  if (name.includes("koei")) return "koei";
  if (["gia nhân", "người hầu", "người ở", "người làm", "đầy tớ", "quản gia", "a hoàn", "hầu gái"]
    .some((label) => name.includes(label))) return "hua_servant";
  return "generic_npc";
}

export function buildWriterContext(state, directorContext, plan) {
  const dialoguePlan = Array.isArray(plan?.dialoguePlan) ? plan.dialoguePlan : [];
  const voiceKeys = new Set(["kai"]);
  dialoguePlan.forEach((entry) => voiceKeys.add(voiceKeyForSpeaker(entry?.speaker)));

  const stageId = String(state?.progression?.stageId || "long_hai");
  return {
    stageId,
    stageLabel: directorContext?.stage?.label || directorContext?.stageLabel || stageId,
    currentLocation: state?.currentLocation || "",
    stageTexture: STAGE_TEXTURES[stageId] || [],
    activeVoices: [...voiceKeys].map((key) => VOICE_CARDS[key]).filter(Boolean),
    proseRules: {
      language: PROSE_STYLE_GUIDE.language,
      targetLength: PROSE_STYLE_GUIDE.targetLength,
      narrationRules: PROSE_STYLE_GUIDE.narrationRules,
      dialogueRules: PROSE_STYLE_GUIDE.dialogueRules,
      choiceRules: PROSE_STYLE_GUIDE.choiceRules,
      bannedHabits: PROSE_STYLE_GUIDE.bannedHabits,
      contrastExample: PROSE_STYLE_GUIDE.contrastExample
    },
    continuity: {
      previousSceneTitle: state?.scene?.title || "",
      previousNarration: Array.isArray(state?.scene?.narration) ? state.scene.narration.slice(-2) : [],
      recentHistory: Array.isArray(state?.recentHistory) ? state.recentHistory.slice(-6) : []
    }
  };
}
