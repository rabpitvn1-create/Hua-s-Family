(function () {
  "use strict";

  const initialState = {
    sceneId: "briefing",
    stats: {
      alert: 0,
      ritual: 10,
      civilianSafety: 100,
      evidence: 0,
      time: 100,
      verification: 0,
      control: 50,
      signalRisk: 0
    },
    flags: {
      intelReviewed: false,
      protocolReviewed: false,
      route: "Chưa chọn",
      networkObserved: false,
      alarmCut: false,
      recordsMarked: false,
      contactStarted: false,
      contactStyle: "Chưa tiếp xúc",
      factRoom: false,
      factCaregiver: false,
      factPreservation: false,
      factPrediction: false,
      cooperationTerms: "Chưa xác lập",
      hardOpening: false,
      counterplanRead: false,
      restraintDelayed: false,
      routeCompromised: false,
      restrained: false
    },
    log: ["Hồ sơ LIBERA-1899 được mở."],
    history: []
  };

  function contactHubParagraphs(state) {
    const verified = state.stats.verification;
    const opening = state.flags.hardOpening
      ? "Mệnh lệnh đầu tiên khiến Tiểu Lan giữ khoảng cách. Cô không tranh cãi; cô chờ xem Kai có thể đưa ra thứ gì ngoài quyền lực."
      : "Kai không yêu cầu Tiểu Lan tin toàn bộ câu chuyện. Anh chỉ nhận trách nhiệm chứng minh từng mệnh đề nhỏ.";

    if (verified === 0) {
      return [
        opening,
        { type: "dialogue", speaker: "Tiểu Lan", text: "Anh nói nơi này không phải chỗ chữa bệnh. Chọn một điều tôi có thể tự kiểm tra." },
        "Cửa sổ an toàn tiếp tục thu hẹp. Mỗi phép thử cho Tiểu Lan thêm dữ kiện, đồng thời cho mạng Hứa Gia thêm thời gian khép lại."
      ];
    }

    if (verified < 3) {
      return [
        `Tiểu Lan đã đối chiếu được ${verified} dữ kiện. Cô thừa nhận phần dữ kiện đó đúng, nhưng không mở rộng kết luận sang cha mình.`,
        { type: "dialogue", speaker: "Tiểu Lan", text: "Một điều đúng không làm mọi điều anh nói thành đúng. Tiếp đi." },
        "Kai phải chọn phép thử tiếp theo mà không biến cuộc nói chuyện thành một bài giảng về tương lai."
      ];
    }

    return [
      `Tiểu Lan đã đối chiếu được ${verified} dữ kiện độc lập. Mô hình “chỉ dưỡng bệnh” không còn giải thích trọn vẹn những gì đang xảy ra.`,
      { type: "dialogue", speaker: "Tiểu Lan", text: "Tôi công nhận những điều ấy. Tôi chưa công nhận kết luận của anh về cha tôi." },
      "Đó là mức hợp tác Kai cần: không phải lòng tin, mà là một khoảng ngắn trong đó cô chấp nhận hành động dựa trên mâu thuẫn đã thấy."
    ];
  }

  function contactHubChoices(state) {
    const choices = [];

    if (!state.flags.factCaregiver) {
      choices.push({
        label: "Để Tiểu Lan gọi người chăm bệnh",
        hint: "Kiểm tra người đó ưu tiên sức khỏe của cô hay mệnh lệnh của mạng lưới.",
        next: "fact_caregiver"
      });
    }

    if (!state.flags.factPreservation) {
      choices.push({
        label: "Đối chiếu mục đích của thuốc và băng",
        hint: "Phân biệt chữa lành với duy trì cơ thể ổn định.",
        next: "fact_preservation"
      });
    }

    if (!state.flags.factPrediction) {
      choices.push({
        label: "Dự đoán phản ứng kế tiếp của biệt thự",
        hint: "Đưa ra một dấu hiệu sắp xảy ra để cô tự quan sát.",
        next: "fact_prediction"
      });
    }

    if (!state.flags.factRoom) {
      choices.push({
        label: "Để cô kiểm tra căn phòng không dùng chữa bệnh",
        hint: "Bằng chứng trực tiếp, nhưng phải rời vị trí an toàn lâu hơn.",
        next: "fact_room"
      });
    }

    if (state.stats.verification >= 3) {
      choices.unshift({
        label: "Dừng giải thích và đề nghị rời phòng",
        hint: "Ba dữ kiện đã đủ cho một cửa sổ hợp tác, không đủ để buộc cô tin Kai.",
        next: "terms"
      });
    }

    return choices;
  }

  function predictionEffects(state) {
    return {
      stats: {
        verification: 1,
        time: -12,
        signalRisk: state.flags.networkObserved ? 5 : 9,
        alert: 5,
        ritual: 10,
        control: state.flags.networkObserved ? 10 : 6
      },
      flags: { factPrediction: true },
      log: "Một phản ứng đồng bộ của biệt thự đã xảy ra đúng như Kai dự đoán."
    };
  }

  function predictionParagraphs(state) {
    const basis = state.flags.networkObserved
      ? "Kai đã quan sát đủ lâu để nhận ra nhịp truyền lệnh trong mạng Tử Mẫu Trùng."
      : "Kai ghép các chuyển động vừa thấy với mô hình phòng vệ của cơ sở.";

    return [
      basis,
      { type: "dialogue", speaker: "Kai", text: "Trong ít phút nữa, các cửa phụ sẽ khép theo thứ tự. Người ngoài hành lang sẽ đổi vị trí cùng lúc. Không ai vào hỏi cô có đau không." },
      "Tiểu Lan không đáp. Cô nhìn về hành lang và lắng nghe.",
      "Một then cửa trượt vào ổ. Sau đó là then thứ hai. Bước chân ngoài hành lang đổi hướng gần như đồng thời; không có ai gọi tên cô.",
      { type: "dialogue", speaker: "Tiểu Lan", text: "Anh biết cách căn nhà phản ứng. Chưa chắc anh biết vì sao." }
    ];
  }

  function counterplanParagraphs(state) {
    const terms = state.flags.cooperationTerms;
    const posture = terms === "Điều kiện của Tiểu Lan"
      ? "Kai chấp nhận để Tiểu Lan tự mang thuốc và tự bước đi. Quyền chủ động nghiêng về phía cô."
      : terms === "Điều kiện sửa đổi"
        ? "Kai cho cô mang thuốc nhưng giữ vị trí giữa cô và lối ra."
        : "Kai không chấp nhận thương lượng thêm. Tiểu Lan chuyển sang phương án buộc anh phải phản ứng.";

    return [
      posture,
      "Tiểu Lan hạ vai, để nhịp thở nặng hơn và đặt một tay lên mép bàn. Bệnh trạng là thật; cách cô cho Kai nhìn thấy nó là một lựa chọn.",
      { type: "dialogue", speaker: "Tiểu Lan", text: "Tôi cần mang thuốc. Nếu anh định đưa một người bệnh đi, ít nhất đừng khiến người đó chết dọc đường." },
      "Yêu cầu hợp lý che ba mục tiêu: kéo Kai lệch khỏi cửa, đưa tay cô tới gần chén sứ và kiểm tra xem anh ưu tiên tốc độ hay an toàn của người được cứu."
    ];
  }

  function counterplanEffects(state) {
    const read = state.flags.counterplanRead;
    return {
      stats: {
        alert: read ? 8 : 18,
        signalRisk: read ? 20 : 35,
        time: read ? -8 : -12,
        control: read ? -8 : -18
      },
      log: read
        ? "Kai chặn được tín hiệu đầu tiên; Tiểu Lan chuyển sang phương án dự phòng."
        : "Tiếng chén sứ trở thành tín hiệu để mạng Hứa Gia đổi thế."
    };
  }

  function counterplanTriggerParagraphs(state) {
    if (state.flags.counterplanRead) {
      return [
        "Ngón tay Tiểu Lan vừa chạm chén sứ, Kai đã giữ nó lại trước khi mặt men chạm nền.",
        "Cô không giằng co với sức mạnh không thể thắng. Phương án dự phòng bắt đầu ngay: cô dồn hơi, bước chéo về phía cửa và dùng danh phận Tứ tiểu thư thay cho vật gây tiếng.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Gọi cha tôi. Có kẻ lạ trong phòng." },
        "Những bước chân ngoài hành lang lập tức dừng lại. Kai đã đọc đúng hành động đầu tiên nhưng chưa vô hiệu hóa mục tiêu của phản kế."
      ];
    }

    return [
      "Tiểu Lan nhấc chén như để uống thuốc rồi buông nó ra ngoài mép bàn. Men sứ vỡ trên nền đủ lớn để xuyên qua cánh cửa.",
      "Cùng lúc, cô bước về phía lối ra thay vì lùi vào góc phòng.",
      { type: "dialogue", speaker: "Tiểu Lan", text: "Gọi cha tôi. Khóa hành lang." },
      "Mệnh lệnh dùng đúng danh phận của cô trong khoảng trống quyền lực. Mạng Hứa Gia nhận được vị trí và một lý do để khép chặt khu nhà chính."
    ];
  }

  function restraintEffects(state) {
    return {
      stats: {
        time: state.flags.restraintDelayed ? -5 : -2,
        alert: state.flags.restraintDelayed ? 6 : 1,
        signalRisk: -55,
        control: 30,
        civilianSafety: -2
      },
      flags: { restrained: true },
      log: "Kai khống chế Tiểu Lan bằng mức lực không gây tử vong và bắt đầu theo dõi y tế."
    };
  }

  function extractionEffects(state) {
    const compromised = state.stats.alert >= 45 || state.stats.signalRisk >= 45 || !state.flags.alarmCut;
    return {
      flags: { routeCompromised: compromised },
      log: compromised
        ? "Đường rút ban đầu không còn an toàn; phải mở tuyến thay thế."
        : "Đường rút còn dùng được nhưng mạng Hứa Gia đang ép sát."
    };
  }

  function extractionParagraphs(state) {
    const route = state.flags.routeCompromised
      ? "Đường rút đã chuẩn bị không còn an toàn. Các cửa phụ bị khóa, người trong nhà đổi vị trí và tuyến Kai dùng để vào đã bị theo dõi."
      : "Tuyến rút Kai đã chuẩn bị vẫn còn một cửa sổ hẹp, nhưng mạng Hứa Gia đang thu ngắn khoảng cách theo từng nhịp.";

    const verification = state.stats.verification >= 4
      ? "Tiểu Lan đã tự đối chiếu bốn mâu thuẫn trước khi bất tỉnh. Khi tỉnh lại, cô có nhiều dữ kiện hơn nhưng vẫn chưa có lý do để giao quyền quyết định cho Elysium."
      : "Tiểu Lan đã tự đối chiếu đủ ba mâu thuẫn để biết lời giải thích dưỡng bệnh có lỗ hổng. Khi tỉnh lại, cô vẫn có thể xem Kai là một kẻ bắt cóc nói đúng vài điều.";

    return [
      "Kai đỡ Tiểu Lan trước khi đầu và vai cô chạm nền. Anh kiểm tra hô hấp, mạch, vùng tổn thương và ghi lại thời điểm mất ý thức.",
      route,
      verification,
      "Giai đoạn tiếp xúc đã kết thúc. Nhiệm vụ chuyển sang tách người được bảo hộ khỏi khu nhà chính, phá điểm neo Long Hải và thu hồi toàn bộ dấu vết thế kỷ 29."
    ];
  }

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
        "Cửa sổ Chronos vẫn mở ở điểm rút. Mạng Hứa Gia đang khép lại phía sau. Cuộc giải cứu thật sự bắt đầu từ cách một người có sức mạnh chứng minh rằng mình không đến để sở hữu người khác."
      ],
      onEnter: {
        setStats: { time: 100, verification: 0, control: 50, signalRisk: 0 },
        flags: { contactStarted: true },
        log: "Bắt đầu giai đoạn tiếp xúc với Hứa Tiểu Lan."
      },
      choices: [
        { label: "Bước vào và để nòng súng hướng xuống", hint: "Cho cô khoảng quan sát trước khi nói.", next: "contact_entry" }
      ]
    },

    contact_entry: {
      kicker: "TIẾP XÚC // LƯỢT MỞ",
      title: "Cô không hỏi anh là ai",
      paragraphs: [
        "Kai bước qua ngưỡng cửa nhưng không tiến thẳng tới giường. MAGNUM GHOST vẫn trong tay anh, nòng súng hướng xuống và lối ra không bị che hoàn toàn.",
        "Tiểu Lan ngồi lệch khỏi vị trí ban đầu. Một tay đặt gần chén thuốc, mắt lần lượt dừng ở súng, cửa, vai Kai và khoảng trống phía sau anh.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Người của cha tôi không dùng thứ đó. Anh muốn tôi đi đâu?" },
        "Câu hỏi không xin danh tính. Cô đang xác định Kai muốn bắt sống, giết, cứu hay dùng mình để đổi lấy thứ khác."
      ],
      choices: [
        {
          label: "Chỉ nói điều cô có thể tự kiểm tra",
          hint: "Nhường một phần nhịp để đổi lấy phép thử có căn cứ.",
          next: "fact_hub",
          effects: {
            stats: { time: -5, control: -8, signalRisk: 4 },
            flags: { contactStyle: "Kiểm chứng từng bước" },
            log: "Kai từ chối yêu cầu niềm tin và chuyển sang dữ kiện có thể đối chiếu."
          }
        },
        {
          label: "Chặn lối ra rồi hỏi cô muốn kiểm tra điều gì",
          hint: "Giữ vị trí chiến thuật nhưng để cô chọn phép thử đầu tiên.",
          next: "fact_hub",
          effects: {
            stats: { time: -4, control: 4, signalRisk: 8 },
            flags: { contactStyle: "Kiểm chứng dưới kiểm soát" },
            log: "Kai giữ cửa và trao cho Tiểu Lan quyền chọn phép thử."
          }
        },
        {
          label: "Ra lệnh đứng yên và tuyên bố nhiệm vụ",
          hint: "Nhanh, nhưng danh nghĩa của người lạ không phải bằng chứng với Tiểu Lan.",
          next: "fact_hub",
          effects: {
            stats: { time: -2, control: 15, signalRisk: 18 },
            flags: { contactStyle: "Mệnh lệnh trực tiếp", hardOpening: true },
            log: "Mệnh lệnh giúp Kai giữ vị trí nhưng làm Tiểu Lan tăng phòng bị."
          }
        }
      ]
    },

    fact_hub: {
      kicker: "TIẾP XÚC // KIỂM CHỨNG",
      title: "Ba điều nhỏ thay cho một câu chuyện lớn",
      paragraphs: contactHubParagraphs,
      choices: contactHubChoices
    },

    fact_caregiver: {
      kicker: "KIỂM CHỨNG // TUYẾN BÁO CÁO",
      title: "Người chăm bệnh hỏi về kẻ lạ trước",
      paragraphs: [
        { type: "dialogue", speaker: "Kai", text: "Gọi người chăm bệnh. Đừng nói tôi đứng ở đâu. Xem điều họ hỏi trước." },
        "Tiểu Lan gọi đủ lớn để hành lang nghe thấy. Một giọng người đáp lại gần như ngay lập tức, nhưng không hỏi cô đau ở đâu hay có cần thuốc không.",
        "Người ngoài cửa hỏi kẻ lạ đang đứng phía nào, rồi im lặng như đang chờ một mệnh lệnh khác truyền tới.",
        "Tiểu Lan nhìn chén thuốc, sau đó nhìn cửa. Cô đã từng nghi việc chăm sóc mình được báo cáo theo hệ thống; lần này ưu tiên của hệ thống lộ ra ngay trước mặt.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Họ vẫn có thể nghĩ anh định hại tôi." },
        { type: "dialogue", speaker: "Kai", text: "Có thể. Nhưng họ vừa chọn vị trí của tôi trước tình trạng của cô." }
      ],
      onEnter: {
        stats: { verification: 1, time: -8, signalRisk: 25, alert: 12, control: -10 },
        flags: { factCaregiver: true },
        log: "Tiểu Lan xác nhận tuyến chăm bệnh ưu tiên mệnh lệnh an ninh."
      },
      choices: [{ label: "Trở lại phép kiểm chứng", next: "fact_hub" }]
    },

    fact_preservation: {
      kicker: "KIỂM CHỨNG // CHĂM SÓC HAY BẢO QUẢN",
      title: "Thuốc giữ cơ thể ổn định nhưng không trả lại cảm giác",
      paragraphs: (state) => [
        "Kai không gọi tên căn bệnh thay cô và không tuyên bố một phương pháp chữa trị thần kỳ.",
        { type: "dialogue", speaker: "Kai", text: "Những thứ trong phòng giảm sốt, giữ vết thương sạch và giúp cô không suy kiệt. Cô đã được nói khi nào cảm giác sẽ trở lại chưa?" },
        "Tiểu Lan nhìn lớp băng đã thay đúng giờ, chén thuốc và những vùng da không còn báo đau. Cô biết sự chăm sóc có hiệu quả; cô cũng biết chưa ai đưa ra một điểm kết thúc cho việc điều trị.",
        state.flags.recordsMarked
          ? "Kai nói thêm rằng tuyến giao nhận anh đã đánh dấu đo lượng vật tư và thời điểm chuyển đồ, nhưng không có mục tiêu phục hồi nào được ghi cùng chúng."
          : "Kai không cần đưa một hồ sơ bí mật. Sự khác biệt nằm ngay trong điều Tiểu Lan đã sống qua: mọi thứ đều nhằm giữ cô ổn định, không nhằm trả lại quyền sử dụng cơ thể.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Giữ một người sống cũng là chữa bệnh." },
        { type: "dialogue", speaker: "Kai", text: "Đúng. Nhưng giữ sống để làm gì là câu hỏi khác." }
      ],
      onEnter: {
        stats: { verification: 1, time: -8, evidence: 1, control: 5 },
        flags: { factPreservation: true },
        log: "Tiểu Lan xác nhận việc chăm sóc không có mục tiêu phục hồi rõ ràng."
      },
      choices: [{ label: "Trở lại phép kiểm chứng", next: "fact_hub" }]
    },

    fact_prediction: {
      kicker: "KIỂM CHỨNG // DỰ ĐOÁN NHỎ",
      title: "Căn nhà tự trả lời",
      paragraphs: predictionParagraphs,
      onEnter: predictionEffects,
      choices: [{ label: "Trở lại phép kiểm chứng", next: "fact_hub" }]
    },

    fact_room: {
      kicker: "KIỂM CHỨNG // CĂN PHÒNG BỊ CẤM",
      title: "Một căn phòng không có thuốc",
      paragraphs: [
        { type: "dialogue", speaker: "Kai", text: "Có một phòng trẻ bỏ trống trong khu cô không được tới. Không có dụng cụ chữa bệnh ở đó. Chỉ có nôi, đồ chơi và bài vị." },
        "Tiểu Lan không nhận lời mô tả ấy là sự thật. Cô yêu cầu tự nhìn.",
        "Kai đứng sang một bên và để cô di chuyển bằng sức mình. Họ dùng một khoảng ngắn giữa hai lần người trong nhà đổi vị trí. Cánh cửa căn phòng bị cấm không khóa.",
        "Bên trong là chiếc nôi không có trẻ, đồ chơi không có dấu sử dụng và những bài vị không thuộc một phòng dưỡng bệnh.",
        "Tiểu Lan chỉ nhìn đủ lâu để xác nhận vật thể. Cô không để Kai quyết định ý nghĩa thay mình.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Căn phòng này không chữa bệnh. Điều đó chưa nói nó dành cho tôi." }
      ],
      onEnter: {
        stats: { verification: 1, time: -18, signalRisk: 10, ritual: 6, evidence: 1, control: -5 },
        flags: { factRoom: true },
        log: "Tiểu Lan trực tiếp xác nhận căn phòng trẻ không phục vụ chữa bệnh."
      },
      choices: [{ label: "Trở lại phòng của Tiểu Lan", next: "fact_hub" }]
    },

    terms: {
      kicker: "TIẾP XÚC // HỢP TÁC CÓ ĐIỀU KIỆN",
      title: "Cô chấp nhận dữ kiện, không trao niềm tin",
      paragraphs: [
        "Tiểu Lan không đổi thái độ thành biết ơn. Cô tách những gì đã kiểm chứng khỏi điều Kai muốn cô kết luận.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Tôi sẽ rời căn phòng này để kiểm tra tiếp. Tôi tự đi, mang thuốc và anh không chạm vào tôi. Nếu người nhà bị thương, tôi dừng lại." },
        "Đề nghị giữ ba thứ: quyền điều khiển cơ thể, phương tiện duy trì sức khỏe và quyền đánh giá Kai qua cách anh đối xử với người trong biệt thự."
      ],
      choices: [
        {
          label: "Chấp nhận toàn bộ điều kiện",
          hint: "Tăng quyền lựa chọn của Tiểu Lan, đồng thời mở thêm khoảng cho phản kế.",
          next: "counterplan_setup",
          effects: {
            stats: { time: -8, control: -15, signalRisk: 12 },
            flags: { cooperationTerms: "Điều kiện của Tiểu Lan" },
            log: "Kai chấp nhận để Tiểu Lan tự đi và tự mang thuốc."
          }
        },
        {
          label: "Cho mang thuốc nhưng yêu cầu đi sau Kai và không gọi ai",
          hint: "Giữ quyền lựa chọn trong giới hạn chiến thuật.",
          next: "counterplan_setup",
          effects: {
            stats: { time: -5, control: 8, signalRisk: 5 },
            flags: { cooperationTerms: "Điều kiện sửa đổi" },
            log: "Kai sửa điều kiện hợp tác để giữ lối ra và tầm quan sát."
          }
        },
        {
          label: "Từ chối thương lượng thêm và yêu cầu rời đi ngay",
          hint: "Giữ thời gian nhưng xác nhận với Tiểu Lan rằng Kai sẵn sàng quyết định thay cô.",
          next: "counterplan_setup",
          effects: {
            stats: { time: -2, control: 20, signalRisk: 25 },
            flags: { cooperationTerms: "Mệnh lệnh của Kai" },
            log: "Kai chấm dứt thương lượng; Tiểu Lan chuyển sang phản kế."
          }
        }
      ]
    },

    counterplan_setup: {
      kicker: "TIỂU LAN // PHẢN KẾ",
      title: "Yêu cầu hợp lý che một phép thử",
      paragraphs: counterplanParagraphs,
      choices: [
        {
          label: "Theo dõi tay, cửa và vật có thể gây tiếng",
          hint: "Đọc mục tiêu của hành động thay vì chỉ nghe yêu cầu.",
          next: "counterplan_trigger",
          effects: {
            stats: { time: -4, control: 10, signalRisk: -5 },
            flags: { counterplanRead: true },
            log: "Kai nhận ra yêu cầu lấy thuốc còn nhằm tạo một tín hiệu."
          }
        },
        {
          label: "Kiểm tra thuốc trước khi cho cô mang theo",
          hint: "Ưu tiên an toàn y tế, nhưng để Tiểu Lan điều khiển vị trí trong phòng.",
          next: "counterplan_trigger",
          effects: {
            stats: { time: -6, control: -5, signalRisk: 12 },
            flags: { counterplanRead: false },
            log: "Kai kiểm tra vật mang theo; Tiểu Lan chiếm được một nhịp vị trí."
          }
        },
        {
          label: "Cảnh báo rằng mọi tiếng gọi sẽ kết thúc thương lượng",
          hint: "Đặt giới hạn rõ, đồng thời cho cô biết chính xác điều Kai sợ.",
          next: "counterplan_trigger",
          effects: {
            stats: { time: -5, control: 5, signalRisk: 8 },
            flags: { counterplanRead: false },
            log: "Lời cảnh báo giúp Tiểu Lan xác định điểm Kai buộc phải phản ứng."
          }
        }
      ]
    },

    counterplan_trigger: {
      kicker: "TIỂU LAN // ĐOẠT NHỊP",
      title: "Phương án đầu chỉ che phương án thứ hai",
      paragraphs: counterplanTriggerParagraphs,
      onEnter: counterplanEffects,
      choices: [
        {
          label: "Chặn cửa và ra lệnh dừng lại",
          next: "last_warning",
          effects: { stats: { control: 8, time: -2 }, log: "Kai giữ lối ra và đưa ra mệnh lệnh cuối." }
        },
        {
          label: "Giữ cổ tay, kéo cô khỏi ngưỡng cửa",
          next: "last_warning",
          effects: { stats: { control: 12, signalRisk: -5, civilianSafety: -1 }, log: "Kai dùng lực tối thiểu để tách Tiểu Lan khỏi lối gọi viện trợ." }
        },
        {
          label: "Để cô nói hết một câu để xác nhận mục tiêu",
          next: "last_warning",
          effects: { stats: { alert: 10, time: -5, control: -5 }, log: "Kai xác nhận Tiểu Lan vẫn ưu tiên giữ đường liên hệ với cha." }
        }
      ]
    },

    last_warning: {
      kicker: "TIẾP XÚC // ĐIỂM GÃY",
      title: "Cô buộc Kai phải chứng minh giới hạn của mình",
      paragraphs: [
        "Tiểu Lan không cố thắng Kai bằng sức. Cô dùng lối ra, tiếng gọi và quyền ra lệnh để biến mỗi giây chần chừ thành lợi thế cho Hứa Gia.",
        { type: "dialogue", speaker: "Tiểu Lan", text: "Nếu anh thật sự cứu tôi, để tôi gọi cha. Nếu anh không dám, anh cũng chỉ đang mang tôi về cho một chủ khác." },
        { type: "dialogue", speaker: "Kai", text: "Không. Cô có thể kiểm tra tôi sau khi còn sống rời khỏi đây." },
        "Cô tiếp tục dịch về phía cửa. Phản kế đã chuyển từ thử lòng sang hành động trực tiếp làm lộ vị trí và thu hẹp cửa sổ ngăn nghi lễ."
      ],
      choices: [
        {
          label: "Kết thúc phản kế ngay bằng mức lực đã khóa",
          hint: "Ưu tiên nhiệm vụ, không kéo dài thành trừng phạt hay thị uy.",
          next: "restraint",
          effects: { flags: { restraintDelayed: false }, log: "Kai quyết định cưỡng chế ngay khi phản kế đe dọa nhiệm vụ." }
        },
        {
          label: "Cho cô một mệnh lệnh cuối cùng để tự dừng",
          hint: "Giữ thêm cơ hội tự nguyện, đổi lại báo động và thời gian.",
          next: "restraint",
          effects: { stats: { time: -4, alert: 6, signalRisk: 8 }, flags: { restraintDelayed: true }, log: "Tiểu Lan không dừng; cửa sổ cưỡng chế an toàn tiếp tục thu hẹp." }
        },
        {
          label: "Đẩy vật gây tiếng khỏi tầm tay rồi áp sát",
          hint: "Giảm nguy cơ tín hiệu thứ hai trước khi cưỡng chế.",
          next: "restraint",
          effects: { stats: { time: -2, signalRisk: -12, control: 5 }, flags: { restraintDelayed: false }, log: "Kai dọn vật gây tiếng và khép góc tiếp cận." }
        }
      ]
    },

    restraint: {
      kicker: "CANON BẮT BUỘC // CƯỠNG CHẾ",
      title: "Một quyết định lạnh, không phải một lời phán xét",
      paragraphs: [
        "Tiểu Lan dồn trọng lượng về phía cửa. Kai cắt góc trước khi cô tạo được thêm khoảng cách.",
        "Anh xoay MAGNUM GHOST, dùng báng súng đánh chính xác vào vùng cổ-gáy với lực được kiểm soát. Đòn đánh kết thúc phản kế mà không nhằm trừng phạt, thị uy hay khiến cô đau thêm.",
        "Kai giữ lấy vai và lưng Tiểu Lan trước khi cô ngã. Cơ thể suy yếu khiến mọi cưỡng chế đều phải được xem như một biến cố y tế, không phải dấu chấm hết tiện lợi cho cuộc đối thoại.",
        "Cô mất ý thức nhưng không mất quyền được biết chuyện gì đã xảy ra, được điều trị và được tiếp tục kiểm tra Elysium khi tỉnh lại."
      ],
      onEnter: restraintEffects,
      choices: [
        {
          label: "Ổn định y tế trước khi mở đường rút",
          next: "extraction_status",
          effects: { stats: { time: -6, civilianSafety: 2 }, log: "Kai ưu tiên kiểm tra và ổn định người được bảo hộ." }
        },
        {
          label: "Kiểm kê phòng trong khi theo dõi sinh tồn",
          next: "extraction_status",
          effects: { stats: { time: -4, evidence: 1, alert: 4 }, log: "Kai vừa theo dõi Tiểu Lan vừa đánh dấu vật chứng cần thu hồi." }
        }
      ]
    },

    extraction_status: {
      kicker: "LIBERA-1899 // CHUYỂN GIAI ĐOẠN",
      title: "Đường rút không còn là đường đã đi vào",
      paragraphs: extractionParagraphs,
      onEnter: extractionEffects,
      choices: [
        { label: "Hoàn tất Vertical Slice 0.2", next: "slice_end" }
      ]
    },

    slice_end: {
      kicker: "VERTICAL SLICE 0.2 // HOÀN TẤT",
      title: "Tiếp xúc kết thúc, cuộc giải cứu chưa xong",
      paragraphs: (state) => [
        "Kai đã cung cấp tối thiểu ba dữ kiện có thể kiểm chứng, cho Tiểu Lan quyền thử lời nói của mình và không yêu cầu cô từ bỏ lòng tin cả đời trong một cuộc nói chuyện.",
        "Tiểu Lan đã hợp tác có giới hạn, dùng bệnh trạng và yêu cầu hợp lý để dựng phản kế, rồi buộc Kai phải lựa chọn giữa tiếp tục thương lượng và bảo toàn nhiệm vụ.",
        `Trạng thái chuyển chương: ${state.stats.verification} dữ kiện đã đối chiếu; báo động ${state.stats.alert}%; cửa sổ tiếp xúc còn ${state.stats.time}%; đường rút ${state.flags.routeCompromised ? "đã bị phá" : "còn một khoảng hẹp"}.`,
        "Vertical Slice 0.3 sẽ bắt đầu bằng việc mang Tiểu Lan khỏi khu nhà chính, xác định điểm neo cần phá và mở tuyến rút khỏi Long Hải."
      ],
      choices: [
        { label: "Chơi lại từ đầu", action: "restart" },
        { label: "Xem lại tình trạng rút", next: "extraction_status" }
      ]
    }
  };

  window.HUA_GAME_DATA = { initialState, scenes };
}());
