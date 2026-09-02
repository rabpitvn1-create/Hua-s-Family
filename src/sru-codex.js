const freeze = (value) => Object.freeze(value);

export const SRU_CODEX = freeze({
  id: "SRU-FORCE-2299-R01",
  status: "CURRENT / USER-LOCKED GAME CANON",
  era: "Năm 2299",
  identity: {
    name: "SRU / Special Response Unit / Lực lượng Phản ứng Đặc biệt",
    parentOrganization: "Cảnh Sát chống hiện tượng dị thường",
    type: "Đơn vị phản ứng hiện trường chuyên xử lý mối đe dọa dị thường vượt quá khả năng của lực lượng thông thường."
  },
  mission: [
    "SRU được điều tới khi cảnh sát thông thường, lực lượng chống khủng bố hoặc quy trình bắt giữ tiêu chuẩn không còn đủ khả năng xử lý một sự cố đang diễn ra.",
    "Phạm vi nhiệm vụ gồm thực thể phi nhân, không gian biến dạng, hiện tượng siêu nhiên và các mối đe dọa dị thường có khả năng gây thương vong.",
    "Nhiệm vụ tại hiện trường gồm phong tỏa, sơ tán dân thường, xác định mối đe dọa, cứu người mắc kẹt, giữ đường rút và vô hiệu hóa mục tiêu khi không còn phương án khống chế an toàn.",
    "SRU là lực lượng phản ứng trực tiếp, không phải một cơ quan nghiên cứu toàn tri ngồi phân loại hồ sơ sau khi sự kiện đã kết thúc."
  ],
  command: {
    captain: "Kai Akechi / Twilight",
    publicRecord: "Hồ sơ công khai của SRU phân loại Kai là Human. Bản chất bán nhân / bán quỷ và huyết thống của Kai là knowledge lock riêng, không tự động trở thành tri thức NPC.",
    fieldRole: "Kai thường nhận phần nguy hiểm nhất của tuyến tiếp cận: mở đường vào vùng nhiễm, giữ chân mục tiêu cấp cao, bảo vệ hành lang sơ tán và tạo khoảng trống cho đồng đội hoặc dân thường rút lui.",
    continuityRule: "Quyền chỉ huy của Kai không biến SRU thành đơn vị chỉ có thể hoạt động khi hắn trực tiếp có mặt."
  },
  structure: [
    "SRU sử dụng các tổ nhỏ đủ độc lập để tiếp tục nhiệm vụ khi liên lạc với chỉ huy hoặc trung tâm bị cắt.",
    "Tùy nhiệm vụ, một tổ có thể gồm nhân sự chiến đấu, trinh sát, cứu hộ-y tế và kỹ thuật dị thường.",
    "Thành viên được phép thay đổi chiến thuật tại chỗ khi điều kiện thực tế khác tình báo hoặc báo cáo ban đầu."
  ],
  doctrine: [
    "Ưu tiên giảm thương vong và bảo vệ dân thường trước mục tiêu vật chất hoặc hành chính.",
    "Giữ đường rút và khả năng sống sót của đội là yêu cầu tác chiến chính thức, không phải biểu hiện thiếu quyết đoán.",
    "SRU không yêu cầu nhân sự tiếp tục một mệnh lệnh đã rõ ràng trở nên vô trách nhiệm chỉ để bảo toàn hình thức chỉ huy.",
    "Điều kiện dị thường có thể làm tình báo ban đầu sai, vô hiệu hóa tuyến rút hoặc thay đổi bản chất mục tiêu; vì vậy quyền phán đoán tại hiện trường là một phần của học thuyết đơn vị.",
    "Trang bị hoặc năng lực đặc biệt của Kai không được suy rộng thành năng lực mặc định của mọi nhân sự SRU."
  ],
  equipment: {
    signatureArmor: "SRU-MK20 là dòng powered armor / exoskeleton nhận diện tiêu biểu của SRU, nền đen-gunmetal và mang đánh dấu POLICE / SRU / SPECIAL RESPONSE UNIT.",
    kaiCurrentLoadout: ["SRU-MK20", "SRU-SG"],
    roleVariation: "Trang bị từng thành viên có thể khác theo nhiệm vụ và vai trò; không mặc định mọi SRU operative có cùng cấp chiến lực hoặc cùng cơ chế trang bị với Kai."
  },
  reputation: "Trong nội bộ lực lượng năm 2299, SRU nổi tiếng đắt đỏ, khó chuẩn hóa và thường gây khó chịu cho bộ phận hành chính vì đặt điều kiện hiện trường lên trên thủ tục. Khi hiện trường vẫn còn người cần cứu và mối đe dọa đã vượt giới hạn lực lượng thông thường, SRU là lực lượng bước vào trước.",
  lore: `Đến năm 2299, sự xuất hiện ngày càng dày của các vụ án liên quan đến thực thể phi nhân, không gian biến dạng và hiện tượng vượt khỏi khả năng giải thích thông thường buộc lực lượng Cảnh Sát chống hiện tượng dị thường phải duy trì một đơn vị phản ứng độc lập tại hiện trường. Đơn vị đó mang tên SRU — Special Response Unit, hay Lực lượng Phản ứng Đặc biệt.

SRU không phải đội điều tra chỉ xuất hiện để phân loại hồ sơ sau khi mọi chuyện đã kết thúc. Nhiệm vụ của họ bắt đầu khi một sự cố vẫn đang diễn ra: phong tỏa khu vực, sơ tán dân thường, xác định mối đe dọa, cứu người mắc kẹt, giữ đường rút và tiêu diệt hoặc vô hiệu hóa mục tiêu nếu không còn phương án khống chế an toàn. Khi cảnh sát thông thường gặp một thứ mà hỏa lực tiêu chuẩn, chiến thuật chống khủng bố hoặc quy trình bắt giữ không còn đủ, SRU được gọi tới.

Kai Akechi, mật danh Twilight, giữ chức Đội trưởng SRU. Hồ sơ công khai của đơn vị coi hắn là Human; bí mật về bản chất bán nhân, bán quỷ và huyết thống thật của Kai không phải kiến thức mà đồng đội, dân thường hoặc NPC được tự động sở hữu. Trong tác chiến, Kai thường nhận phần nguy hiểm nhất: mở đường vào khu nhiễm, giữ chân thực thể cấp cao hoặc tạo hành lang để đồng đội đưa dân thường ra ngoài. Tuy nhiên SRU không được xây quanh giả định rằng Kai luôn có mặt. Một tổ phải đủ khả năng tiếp tục nhiệm vụ khi Đội trưởng bị tách khỏi đội hình hoặc liên lạc bị cắt.

Cơ cấu SRU dựa trên các tổ nhỏ có quyền tự chủ chiến thuật. Tùy nhiệm vụ, đội hình có thể gồm nhân sự chiến đấu, trinh sát, cứu hộ-y tế và kỹ thuật dị thường. Thành viên được phép đổi phương án tại chỗ nếu thực tế khác báo cáo ban đầu. Học thuyết của đơn vị đặt việc giảm thương vong, bảo vệ dân thường, duy trì đường rút và giữ năng lực chiến đấu của đội cao hơn việc thu hồi mẫu vật, bảo vệ tài sản hay giữ thể diện cho cấp hành chính.

SRU cũng không yêu cầu nhân sự tiếp tục một mệnh lệnh đã rõ ràng trở nên vô trách nhiệm chỉ để bảo toàn hình thức chỉ huy. Hiện tượng dị thường có thể làm tình báo sai, cắt tuyến rút hoặc thay đổi bản chất mục tiêu trong vài phút. Vì vậy quyền phán đoán tại hiện trường là một phần chính thức của học thuyết SRU.

Dòng SRU-MK20 là powered armor / exoskeleton nhận diện tiêu biểu của lực lượng, mang nền đen-gunmetal và đánh dấu POLICE / SRU / SPECIAL RESPONSE UNIT. Kai sử dụng SRU-MK20 cùng SRU-SG trong cấu hình hiện hành. Điều đó không có nghĩa mọi thành viên SRU sở hữu cùng trang bị, cấp chiến lực hoặc năng lực như hắn.

Trong nội bộ lực lượng năm 2299, SRU nổi tiếng đắt đỏ, khó chuẩn hóa và thường khiến bộ phận hành chính đau đầu. Ngoài hiện trường, điều đó ít quan trọng hơn một thực tế: khi vẫn còn người cần cứu và thứ phía trước đã vượt khỏi giới hạn của lực lượng thông thường, SRU là lực lượng bước vào trước.`
});

// Bản gọn được đưa vào Director/Writer prompt mỗi lượt. Full lore ở trên vẫn là nguồn
// canon trong APK, nhưng không cần đốt lại toàn bộ số token của đoạn lịch sử ở mọi lượt.
export const SRU_PROMPT_CANON = freeze({
  id: SRU_CODEX.id,
  identity: SRU_CODEX.identity,
  mission: SRU_CODEX.mission,
  command: SRU_CODEX.command,
  structure: SRU_CODEX.structure,
  doctrine: SRU_CODEX.doctrine,
  equipment: SRU_CODEX.equipment,
  reputation: SRU_CODEX.reputation
});
