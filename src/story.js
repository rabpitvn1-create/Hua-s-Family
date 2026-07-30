(function () {
  "use strict";

  const initialState = {
    sceneId: "briefing",
    stats: {
      alert: 0,
      ritual: 10,
      civilianSafety: 100,
      evidence: 0
    },
    flags: {
      intelReviewed: false,
      protocolReviewed: false,
      route: "Chưa chọn",
      networkObserved: false,
      alarmCut: false,
      recordsMarked: false
    },
    log: ["Hồ sơ LIBERA-1899 được mở."],
    history: []
  };

  const scenes = {
    briefing: {
      kicker: "ELYSIUM // LIBERA-1899",
      title: "Một người không biết mình cần được cứu",
      paragraphs: [
        "Màn hình kính đen hiện lên giữa phòng chuẩn bị của Chronos. Năm đích: 1899. Địa điểm: biệt thự Hứa Gia tại Long Hải, Nam Kỳ.",
        "Hứa Tiểu Lan đã tự nguyện tới đó vì tin cha đưa mình đi dưỡng bệnh. Elysium xác nhận cơ sở đang chuẩn bị cô làm vật chứa trực tiếp cho một thực thể cấp Quỷ Vương.",
        "Nhiệm vụ của Kai, mật danh Phantom, không chỉ là đưa cô ra ngoài. Anh phải ngăn nghi lễ, phân biệt người bị ép với tín đồ tự nguyện, giữ kín công nghệ tương lai và không biến người được cứu thành tài sản của một tổ chức khác."
      ],
      choices: [
        { label: "Đọc tình báo đã xác nhận", hint: "Khóa các dữ kiện không được phép suy diễn.", next: "intel" },
        { label: "Rà lại quy tắc giao chiến", hint: "Xác định giới hạn dùng lực tại biệt thự.", next: "protocol" },
        { label: "Mở cửa sổ Chronos", hint: "Triển khai ngay tới Long Hải.", next: "gate" }
      ]
    },

    intel: {
      kicker: "TÌNH BÁO // ĐÃ XÁC NHẬN",
      title: "Những điều Tiểu Lan chưa biết",
      paragraphs: [
        "Tiểu Lan là con gái thứ tư của Chú Hỏa. Cô mắc bệnh phong do chính cha chủ động sắp đặt, nhưng vẫn tin ông đang chữa bệnh cho mình.",
        "Cô không mang Tử Mẫu Trùng. Mọi người làm công chính thức tại biệt thự đều mang trùng, song mức độ tự nguyện và trách nhiệm của từng người chưa thể kết luận từ một lần quét.",
        "La Sát Mẫu chưa giáng thế. Phá cơ sở Long Hải chỉ cắt một điểm neo; không tiêu diệt toàn bộ Hứa Gia và không kết thúc mối đe dọa."
      ],
      onEnter: { flags: { intelReviewed: true }, log: "Đã đọc tình báo cốt lõi." },
      choices: [
        { label: "Rà quy tắc giao chiến", next: "protocol" },
        { label: "Trở lại hồ sơ chính", next: "briefing" },
        { label: "Triển khai", next: "gate" }
      ]
    },

    protocol: {
      kicker: "VENATORES // QUY TẮC GIAO CHIẾN",
      title: "Mang ký sinh không đồng nghĩa có cùng tội",
      paragraphs: [
        "Không khai hỏa chỉ vì cảm biến phát hiện Tử Mẫu Trùng. Kai phải đánh giá hành vi, vai trò và nguy cơ trực tiếp.",
        "Ưu tiên vô hiệu hóa chính xác, không gây chết người khi tình thế cho phép. Không bỏ mặc một mối đe dọa đang có khả năng giết dân thường chỉ để giữ vẻ nhân đạo.",
        "Mọi mảnh vỡ, đạn, thiết bị, máu mô cải biến và dữ liệu thế kỷ 29 phải được thu hồi trước khi cổng đóng."
      ],
      onEnter: { flags: { protocolReviewed: true }, log: "Đã khóa quy tắc giao chiến." },
      choices: [
        { label: "Đọc tình báo", next: "intel" },
        { label: "Trở lại hồ sơ chính", next: "briefing" },
        { label: "Triển khai", next: "gate" }
      ]
    },

    gate: {
      kicker: "CHRONOS // CỬA SỔ MỞ",
      title: "Long Hải, năm 1899",
      paragraphs: [
        "Không khí mặn đi qua lớp lọc của giáp. Sau lưng Kai, khe sáng của thế kỷ 29 co lại thành một đường mảnh rồi biến mất.",
        "Phía trước là một cộng đồng ven biển vẫn còn thức theo con nước. Xa hơn, biệt thự Hứa Gia sáng đèn như một nơi dưỡng bệnh: sân phơi thuốc, nhà phụ, bếp và những lối vận chuyển nối về phía biển.",
        "Cảm biến nhận được nhiều tín hiệu sinh học đồng dạng trong khuôn viên. Chưa tín hiệu nào tự nó cho phép anh kết luận ai đáng chết."
      ],
      onEnter: { stats: { ritual: 5 }, log: "Đã tới Long Hải năm 1899." },
      choices: [
        {
          label: "Đi theo bờ đá và quan sát từ cao",
          hint: "Chậm hơn nhưng giảm khả năng chạm người ngoài.",
          next: "cliff_route",
          effects: { stats: { ritual: 12 }, flags: { route: "Bờ đá" }, log: "Chọn đường bờ đá." }
        },
        {
          label: "Bám theo lối vận chuyển phía sau",
          hint: "Có cơ hội thu thập chứng cứ, nguy cơ bị nhận diện cao hơn.",
          next: "service_route",
          effects: { stats: { alert: 8, ritual: 7 }, flags: { route: "Lối vận chuyển" }, log: "Chọn lối vận chuyển." }
        },
        {
          label: "Tiếp cận thẳng qua vườn thuốc",
          hint: "Nhanh nhất, ít thời gian quan sát vai trò của người trong nhà.",
          next: "garden_route",
          effects: { stats: { alert: 15, ritual: 3 }, flags: { route: "Vườn thuốc" }, log: "Chọn đường qua vườn thuốc." }
        }
      ]
    },

    cliff_route: {
      kicker: "THÂM NHẬP // BỜ ĐÁ",
      title: "Căn nhà không cần phô ra song sắt",
      paragraphs: [
        "Từ sườn đá, Kai dựng lại nhịp di chuyển của khu nhà. Người làm mang thuốc, nước nóng và băng vải theo những tuyến đều đặn. Họ không giống một đội quân chờ lệnh; họ giống các bộ phận đã quen làm việc trong cùng một cơ thể.",
        "Một nhịp cộng hưởng chạy qua nhiều tín hiệu sinh học cùng lúc. Những người ở ba dãy nhà đổi hướng gần như đồng thời, nhưng không ai tỏ ra hoảng sợ.",
        "Quan sát đủ lâu giúp anh đánh dấu đường báo động mà không cần chạm vào bất kỳ ai. Cái giá là nghi lễ tiếp tục tiến gần."
      ],
      onEnter: { stats: { evidence: 1 }, flags: { networkObserved: true }, log: "Ghi nhận nhịp phối hợp của mạng Tử Mẫu Trùng." },
      choices: [
        { label: "Cắt đường báo động rồi tiến vào", next: "perimeter", effects: { stats: { alert: -5 }, flags: { alarmCut: true }, log: "Đường báo động ngoài khu nhà bị cô lập." } },
        { label: "Bỏ qua đường báo động để giữ thời gian", next: "perimeter", effects: { stats: { ritual: -4, alert: 5 }, log: "Ưu tiên cửa sổ giải cứu." } }
      ]
    },

    service_route: {
      kicker: "THÂM NHẬP // LỐI VẬN CHUYỂN",
      title: "Thuốc, băng vải và một danh sách không ghi bệnh",
      paragraphs: [
        "Một xe đẩy từ nhà kho dừng dưới mái che. Trên đó có thuốc, băng vải sạch và những hũ men được niêm kín. Người đẩy xe trao một thẻ gỗ cho thủ kho rồi nhận lại đúng số đồ đã định.",
        "Không có gì trong cảnh ấy giống một cuộc bắt cóc. Sự chăm sóc là thật. Chính vì vậy, hệ thống giữ Tiểu Lan ở đây càng khó bị nhìn thấy từ bên trong.",
        "Kai có thể đánh dấu sổ giao nhận để thu hồi sau, hoặc tiếp tục bám theo xe tới khu nhà chính."
      ],
      choices: [
        { label: "Đánh dấu vị trí sổ giao nhận", hint: "Tăng chứng cứ, mất thêm thời gian.", next: "perimeter", effects: { stats: { evidence: 2, ritual: 8, alert: 4 }, flags: { recordsMarked: true }, log: "Đã đánh dấu hồ sơ vận chuyển để thu hồi." } },
        { label: "Bám theo xe tới khu nhà chính", hint: "Giữ thời gian, chấp nhận ít dữ liệu hơn.", next: "perimeter", effects: { stats: { ritual: 2, alert: 3 }, log: "Bám theo tuyến chăm bệnh vào khu nhà chính." } }
      ]
    },

    garden_route: {
      kicker: "THÂM NHẬP // VƯỜN THUỐC",
      title: "Người làm vườn quay đầu cùng một lúc",
      paragraphs: [
        "Kai vượt qua hàng cây thấp trước khi người làm vườn đầu tiên kịp nhìn rõ. Một người khác ở gần bếp nghiêng đầu. Rồi một người thứ ba đặt thúng xuống.",
        "Phản ứng lan qua khuôn viên không bằng tiếng gọi. Mạng liên kết đã nhận thấy một sai lệch nhưng chưa xác định được nó là gì.",
        "Anh còn một nhịp để chọn: biến mất khỏi đường nhìn hoặc khống chế người gần nhất trước khi tín hiệu được xác nhận."
      ],
      choices: [
        { label: "Dùng địa hình cắt tầm nhìn", next: "perimeter", effects: { stats: { alert: 8, ritual: 4 }, log: "Thoát khỏi đường nhìn trước khi báo động hoàn chỉnh." } },
        { label: "Khống chế không gây chết người", next: "perimeter", effects: { stats: { alert: 15, civilianSafety: -3, ritual: -2 }, log: "Một vật chủ bị vô hiệu hóa và theo dõi sinh tồn." } }
      ]
    },

    perimeter: {
      kicker: "BIỆT THỰ // VÀNH NGOÀI",
      title: "Cơ sở bắt đầu thức tỉnh",
      paragraphs: [
        "Các cửa phụ khép lại theo thứ tự. Người trong nhà không chạy loạn; họ đổi vị trí để khóa hành lang, che người ngoài và giữ khu nhà chính tách khỏi sân.",
        "Kai xác định được hai ưu tiên cạnh tranh: tiếp tục cắt mạng để giảm số người phải đối đầu, hoặc dùng cửa sổ hiện tại tiến thẳng về phía tín hiệu sinh học không mang ký sinh.",
        "Tín hiệu ấy ở sâu trong khu nhà chính. Hứa Tiểu Lan vẫn còn sống."
      ],
      choices: [
        {
          label: "Cắt thêm một mắt xích của mạng",
          hint: "Giảm báo động, tăng áp lực nghi lễ.",
          next: "inner_hall",
          effects: { stats: { alert: -10, ritual: 12, evidence: 1 }, flags: { networkObserved: true }, log: "Một điểm truyền của mạng bị vô hiệu hóa." }
        },
        {
          label: "Tiến thẳng tới tín hiệu của Tiểu Lan",
          hint: "Giữ thời gian nhưng để mạng phía sau còn hoạt động.",
          next: "inner_hall",
          effects: { stats: { alert: 12, ritual: -5 }, log: "Ưu tiên tiếp xúc người được bảo hộ." }
        }
      ]
    },

    inner_hall: {
      kicker: "BIỆT THỰ // KHU NHÀ CHÍNH",
      title: "Sự tử tế không chứng minh được vô tội",
      paragraphs: [
        "Mùi thuốc sắc phủ kín hành lang. Băng vải được gấp ngay ngắn bên một chậu nước còn ấm. Không có dấu hiệu ai bỏ mặc người bệnh.",
        "Phía sau, mạng ký sinh điều chỉnh đội hình. Phía trước, một tiếng ho bị nén lại sau cánh cửa không khóa.",
        "Elysium đã cảnh báo: Tiểu Lan đủ thông minh để chống lại một cuộc giải cứu, nhưng chưa có dữ kiện để hiểu nó là giải cứu. Kai kiểm tra góc súng, lối rút và khoảng cách tới cửa."
      ],
      onEnter: { stats: { ritual: 8 }, log: "Đã tới khu nhà chính." },
      choices: [
        { label: "Dừng một nhịp để kiểm tra lối rút", next: "door", effects: { stats: { ritual: 5, alert: -3 }, log: "Đường rút được cập nhật trước tiếp xúc." } },
        { label: "Tiếp cận cửa ngay", next: "door", effects: { stats: { alert: 3 }, log: "Tiếp xúc mục tiêu được ưu tiên." } }
      ]
    },

    door: {
      kicker: "MỐC CHƯƠNG // TIẾP XÚC",
      title: "Người ở bên kia cửa đã biết",
      paragraphs: [
        "Bên trong, tiếng chén sứ chạm mặt bàn rất khẽ. Không có tiếng gọi người. Không có bước chân chạy khỏi phòng.",
        "Kai nhìn thấy bóng người dịch khỏi vị trí dễ quan sát nhất. Tiểu Lan đang giảm chuyển động, kiểm tra lối ra và chờ kẻ ngoài cửa tự để lộ mục đích.",
        "Cửa sổ Chronos vẫn mở ở điểm rút. Mạng Hứa Gia đang khép lại phía sau. Cuộc giải cứu thật sự bắt đầu từ lựa chọn tiếp theo — cách một người có sức mạnh chứng minh rằng mình không đến để sở hữu người khác."
      ],
      choices: [
        { label: "Hoàn tất vertical slice", hint: "Lưu trạng thái lựa chọn để dùng cho chương tiếp theo.", next: "slice_end" }
      ]
    },

    slice_end: {
      kicker: "VERTICAL SLICE 0.1 // HOÀN TẤT",
      title: "Dòng thời gian đã được ghi",
      paragraphs: [
        "Bản chơi thử đầu tiên kết thúc trước cuộc đối thoại bắt buộc với Hứa Tiểu Lan.",
        "Những lựa chọn vừa thực hiện đã tạo trạng thái mở đầu cho chương tiếp theo: mức báo động, áp lực nghi lễ, an toàn dân sự, chứng cứ và đường tiếp cận.",
        "Mọi nhánh tiếp theo phải hội tụ về các mốc canon đã khóa: Tiểu Lan không tin Kai, chống lại việc bị đưa đi, và chiến thắng tại Long Hải chỉ là cắt một chân rết của Hứa Gia."
      ],
      choices: [
        { label: "Chơi lại từ đầu", action: "restart" },
        { label: "Quay lại cánh cửa", next: "door" }
      ]
    }
  };

  window.HUA_GAME_DATA = { initialState, scenes };
}());
