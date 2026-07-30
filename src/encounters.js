(function () {
  "use strict";

  const data = window.HUA_GAME_DATA;
  if (!data || !data.scenes || !data.initialState) return;

  const encounters = {
    manylimb: {
      name: "Kẻ Khóa Hành Lang",
      image: "assets/encounters/ke-khoa-hanh-lang.svg",
      cssClass: "encounter-manylimb",
      threat: "RẤT CAO",
      recoverability: "CHƯA XÁC ĐỊNH",
      role: "Các chi phụ neo vào tường và khung cửa, biến cơ thể vật chủ thành một chốt sống khóa đường tiến.",
      intro: "Một người hầu nam cong lưng giữa hành lang. Những chi phụ mọc từ vai và sống lưng bám vào hai phía khung cửa, giữ cả đoạn nhà như một chiếc bẫy đang khép.",
      scan: "Nhịp co của các chi phụ đi trước chuyển động có ý thức nửa nhịp. Vật chủ vẫn còn phản xạ né đau, nhưng mạng ký sinh đang giành quyền điều khiển vận động."
    },
    bloom: {
      name: "Mẫu Hầu Trổ Nhánh",
      image: "assets/encounters/mau-hau-tro-nhanh.svg",
      cssClass: "encounter-bloom",
      threat: "CAO",
      recoverability: "CÓ THỂ",
      role: "Chi trước kéo dài để giữ, quấn và kéo người bệnh trở lại khu chăm sóc.",
      intro: "Người chăm bệnh bước ra từ bóng tối với một cánh tay đã kéo dài thành nhiều nhánh móc. Miệng bà vẫn lặp lại lời dỗ dành, trong khi cơ thể tự tìm cách giữ Kai ở lại hành lang.",
      scan: "Giọng nói còn mang nhịp thở và phản ứng sợ hãi của con người. Khối ký sinh ở vai đang ép cánh tay thực hiện một vai trò chăm sóc bị biến thành cưỡng giữ."
    },
    reacher: {
      name: "Phu Gác Kéo Dài",
      image: "assets/encounters/phu-gac-keo-dai.svg",
      cssClass: "encounter-reacher",
      threat: "TRUNG BÌNH–CAO",
      recoverability: "CÓ THỂ",
      role: "Một cánh tay tăng chiều dài để khóa khoảng cách, kéo chuông báo và giữ cửa.",
      intro: "Người gác già nghiêng người cạnh cầu thang. Cánh tay phải đã kéo dài quá tỷ lệ cơ thể, quét sát nền để tìm cổ chân và dây báo động cùng lúc.",
      scan: "Khối ký sinh tập trung ở vai phải; phần còn lại của cơ thể chưa biến đổi hoàn toàn. Ông vẫn cố rút tay về mỗi khi nó chạm gần ngọn đèn nóng."
    },
    carrier: {
      name: "Người Gánh Ổ Trùng",
      image: "assets/encounters/nguoi-ganh-o-trung.svg",
      cssClass: "encounter-carrier",
      threat: "CAO",
      recoverability: "THẤP",
      role: "Khối ký sinh trên lưng phân phối chi phụ để chặn đường và truyền tín hiệu về mạng.",
      intro: "Một người đàn bà gánh giỏ vận chuyển khựng lại giữa lối đi. Khối u trên lưng mở ra thành nhiều chi phụ, còn bàn tay bà vẫn giữ quai giỏ như đang cố hoàn thành công việc cuối cùng.",
      scan: "Cơ thể vật chủ còn phản ứng với tên gọi và vật quen thuộc, nhưng ổ trùng trên lưng đã trở thành nút truyền tín hiệu độc lập. Mọi tổn thương mạnh có thể lan báo động qua toàn khu nhà."
    }
  };

  Object.assign(data.initialState.flags, {
    encounterStarted: false,
    encounterType: "",
    encounterApproach: "",
    encounterOutcome: "",
    hostRecoverable: false
  });

  function encounterForState(state) {
    if (state.stats.alert >= 30) return "manylimb";
    if (state.flags.route === "Lối vận chuyển") return "carrier";
    if (state.flags.route === "Bờ đá") return "reacher";
    return "bloom";
  }

  function encounterSceneId(state) {
    return `encounter_${encounterForState(state)}`;
  }

  function encounterEntry(state) {
    return encounters[state.flags.encounterType] || encounters.manylimb;
  }

  function encounterCard(entry) {
    return {
      text: "",
      className: `encounter-visual ${entry.cssClass}`
    };
  }

  function buildEncounterScene(id) {
    const entry = encounters[id];

    return {
      kicker: "ĐỤNG ĐỘ // VẬT CHỦ THỨC TỈNH",
      title: entry.name,
      paragraphs: [
        encounterCard(entry),
        entry.intro,
        entry.role,
        "Kai chỉ có vài giây để quyết định đây là một mục tiêu phải tiêu diệt, một vật chủ còn có thể cứu, hay một chướng ngại nên tránh."
      ],
      onEnter: {
        stats: { alert: id === "manylimb" ? 6 : 3, ritual: 3 },
        flags: {
          encounterStarted: true,
          encounterType: id,
          encounterApproach: "",
          encounterOutcome: "",
          hostRecoverable: false
        },
        log: `Đụng độ ${entry.name} tại khu nhà chính.`
      },
      choices: [
        {
          label: "Quét vai trò và nhịp điều khiển",
          hint: "Mất thời gian để phân biệt ý thức vật chủ với phản xạ của ký sinh.",
          next: "encounter_response",
          effects: {
            stats: { ritual: 6, alert: 2, evidence: 1 },
            flags: { encounterApproach: "Phân loại", hostRecoverable: true },
            log: "Kai trì hoãn khai hỏa để phân loại vật chủ và chức năng biến đổi."
          }
        },
        {
          label: "Dùng xung điện khóa cơ",
          hint: "Khống chế nhanh, nhưng dòng điện có thể làm tổn thương người đang bị ký sinh.",
          next: "encounter_response",
          effects: {
            stats: { alert: 7, ritual: 2, civilianSafety: -2 },
            flags: { encounterApproach: "Khống chế", hostRecoverable: true },
            log: "Kai dùng xung điện để cắt nhịp vận động của vật chủ."
          }
        },
        {
          label: "Bắn phá khối ký sinh lộ thiên",
          hint: "Mở đường nhanh nhất; tiếng súng và tổn thương vật chủ sẽ có hậu quả.",
          next: "encounter_response",
          effects: {
            stats: { alert: 18, ritual: -4, civilianSafety: -9 },
            flags: { encounterApproach: "Hỏa lực", hostRecoverable: false },
            log: "Kai dùng hỏa lực trực tiếp vào khối ký sinh đang lộ."
          }
        }
      ]
    };
  }

  Object.keys(encounters).forEach((id) => {
    data.scenes[`encounter_${id}`] = buildEncounterScene(id);
  });

  function responseParagraphs(state) {
    const entry = encounterEntry(state);
    const approach = state.flags.encounterApproach;

    if (approach === "Phân loại") {
      return [
        encounterCard(entry),
        entry.scan,
        "Kết quả không cho phép gọi vật chủ là vô tội tuyệt đối, nhưng cũng không cho phép xem cơ thể này chỉ còn là một con quái vật. Kai phải chọn cách kết thúc đụng độ."
      ];
    }

    if (approach === "Khống chế") {
      return [
        encounterCard(entry),
        "Xung điện làm các chi phụ co giật và nhả khỏi điểm bám. Vật chủ đổ xuống nhưng vẫn thở; mạng ký sinh đang cố nối lại quyền điều khiển qua các bó cơ bị khóa.",
        "Kai có một khoảng ngắn để trói, đánh dấu cứu hộ hoặc bỏ lại trước khi toàn hành lang thức tỉnh."
      ];
    }

    return [
      encounterCard(entry),
      "Phát bắn xé khối ký sinh khỏi điểm bám. Cơ thể vật chủ ngã theo, còn các chi phụ tiếp tục quẫy và kéo máu về phía sâu trong nhà.",
      "Đường đi đã mở, nhưng tiếng súng, mô cải biến và vỏ đạn tương lai đều trở thành dấu vết Kai phải xử lý."
    ];
  }

  function responseChoices(state) {
    const approach = state.flags.encounterApproach;

    if (approach === "Phân loại") {
      return [
        {
          label: "Cắt nhịp ký sinh rồi trói vật chủ",
          hint: "Ưu tiên giữ mạng sống; tốn thời gian và để mạng phía sau áp sát.",
          next: "encounter_aftermath",
          effects: {
            stats: { alert: 5, ritual: 7, civilianSafety: -1, evidence: 1 },
            flags: { encounterOutcome: "Khống chế sống", hostRecoverable: true },
            log: "Vật chủ được khống chế sống và đánh dấu để cứu hộ."
          }
        },
        {
          label: "Dụ vào phòng phụ rồi khóa cửa",
          hint: "Không tiếp tục gây thương tích, nhưng mối đe dọa có thể thoát ra sau đó.",
          next: "encounter_aftermath",
          effects: {
            stats: { alert: 3, ritual: 9 },
            flags: { encounterOutcome: "Cô lập tạm thời", hostRecoverable: true },
            log: "Kai cô lập vật chủ trong phòng phụ và giữ đường tiến."
          }
        },
        {
          label: "Chuyển sang hỏa lực khi chi phụ lao tới",
          hint: "Giảm nguy cơ tức thời; đánh đổi khả năng cứu vật chủ.",
          next: "encounter_aftermath",
          effects: {
            stats: { alert: 13, ritual: -3, civilianSafety: -8 },
            flags: { encounterOutcome: "Tiêu diệt", hostRecoverable: false },
            log: "Kai chuyển sang hỏa lực sau khi đòn tấn công trực tiếp bắt đầu."
          }
        }
      ];
    }

    if (approach === "Khống chế") {
      return [
        {
          label: "Trói, kiểm tra hô hấp và đánh dấu cứu hộ",
          hint: "Biến một lần khống chế thành cơ hội cứu người, nhưng mất cửa sổ hành động.",
          next: "encounter_aftermath",
          effects: {
            stats: { alert: 5, ritual: 7, civilianSafety: 1, evidence: 1 },
            flags: { encounterOutcome: "Khống chế sống", hostRecoverable: true },
            log: "Kai ổn định vật chủ sau xung điện và đánh dấu vị trí."
          }
        },
        {
          label: "Chỉ khóa khớp rồi tiếp tục tiến",
          hint: "Nhanh hơn, nhưng vật chủ có thể bị mạng kéo vận động trở lại.",
          next: "encounter_aftermath",
          effects: {
            stats: { alert: 4, ritual: 2, civilianSafety: -4 },
            flags: { encounterOutcome: "Vô hiệu hóa tạm thời", hostRecoverable: true },
            log: "Kai để vật chủ trong trạng thái vô hiệu hóa tạm thời."
          }
        }
      ];
    }

    return [
      {
        label: "Thu hồi mô ký sinh và mọi dấu vết phát bắn",
        hint: "Tuân thủ quy tắc thời gian; mất thêm thời gian trước khi tiến sâu.",
        next: "encounter_aftermath",
        effects: {
          stats: { alert: 5, ritual: 8, evidence: 2 },
          flags: { encounterOutcome: "Tiêu diệt và thu hồi", hostRecoverable: false },
          log: "Mô ký sinh và dấu vết công nghệ được thu hồi khỏi hành lang."
        }
      },
      {
        label: "Rút khỏi điểm bắn trước khi mạng kéo xác về",
        hint: "Giữ thời gian, chấp nhận để lại thêm bằng chứng sinh học cho Hứa Gia.",
        next: "encounter_aftermath",
        effects: {
          stats: { alert: 9, ritual: -2, evidence: -1 },
          flags: { encounterOutcome: "Tiêu diệt, chưa thu hồi đủ", hostRecoverable: false },
          log: "Kai rời điểm bắn trước khi hoàn tất thu hồi."
        }
      }
    ];
  }

  data.scenes.encounter_response = {
    kicker: "ĐỤNG ĐỘ // PHẢN ỨNG",
    title: "Một cơ thể, hai ý chí",
    paragraphs: responseParagraphs,
    choices: responseChoices
  };

  data.scenes.encounter_aftermath = {
    kicker: "ĐỤNG ĐỘ // KẾT QUẢ",
    title: "Mở đường không đồng nghĩa giải quyết xong",
    paragraphs: (state) => {
      const entry = encounterEntry(state);
      const outcome = state.flags.encounterOutcome || "Chưa xác định";
      const recoverable = state.flags.hostRecoverable
        ? "Vật chủ vẫn còn khả năng sống và phải được xem là người cần phân loại, điều trị hoặc giam giữ an toàn."
        : "Khả năng cứu vật chủ đã bị mất hoặc chưa thể xác nhận sau mức lực đã sử dụng.";

      return [
        encounterCard(entry),
        `Kết quả đụng độ: ${outcome}.`,
        recoverable,
        "Những chi phụ ngừng chặn lối, nhưng phản ứng của mạng cho thấy biệt thự đã ghi nhận một mắt xích bị tổn thương. Kai vẫn phải tới Tiểu Lan trước khi nghi lễ vượt điểm đảo ngược."
      ];
    },
    choices: [
      {
        label: "Tiếp tục vào khu nhà chính",
        hint: "Mang hậu quả của đụng độ sang giai đoạn tiếp xúc.",
        next: "inner_hall"
      }
    ]
  };

  if (data.scenes.perimeter && Array.isArray(data.scenes.perimeter.choices)) {
    data.scenes.perimeter.choices.forEach((choice) => {
      choice.next = encounterSceneId;
    });
  }

  const styles = document.createElement("style");
  styles.dataset.encounterSystem = "true";
  styles.textContent = `
    .encounter-visual {
      min-height: 0;
      margin: 0 0 1.35rem !important;
    }

    .encounter-card {
      display: grid;
      grid-template-columns: minmax(11rem, 15rem) 1fr;
      gap: 1rem;
      align-items: stretch;
      overflow: hidden;
      border: 1px solid var(--line);
      border-left: 3px solid var(--danger);
      border-radius: .5rem;
      background:
        linear-gradient(145deg, rgb(182 83 73 / 8%), transparent 55%),
        #100d0c;
      box-shadow: 0 18px 38px rgb(0 0 0 / 28%);
    }

    .encounter-card img {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 13.5rem;
      object-fit: cover;
      background: #090706;
      filter: contrast(1.05) saturate(.88);
    }

    .encounter-card__body {
      display: grid;
      align-content: center;
      gap: .7rem;
      padding: 1rem 1rem 1rem 0;
    }

    .encounter-card__eyebrow,
    .encounter-card__meta {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      letter-spacing: .07em;
      text-transform: uppercase;
    }

    .encounter-card__eyebrow {
      color: var(--danger);
      font-size: .68rem;
    }

    .encounter-card__name {
      margin: 0;
      color: var(--ink);
      font-size: clamp(1.25rem, 3vw, 1.8rem);
      font-weight: 500;
    }

    .encounter-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: .45rem;
      color: var(--muted);
      font-size: .66rem;
    }

    .encounter-card__meta span {
      padding: .3rem .45rem;
      border: 1px solid var(--line);
      background: rgb(255 255 255 / 2%);
    }

    .encounter-card__role {
      margin: 0;
      color: #d7c7bb;
      font-size: .92rem;
      line-height: 1.55;
    }

    @media (max-width: 620px) {
      .encounter-card {
        grid-template-columns: 1fr;
      }

      .encounter-card img {
        aspect-ratio: 16 / 10;
        min-height: 0;
      }

      .encounter-card__body {
        padding: 0 1rem 1rem;
      }
    }
  `;
  document.head.append(styles);

  const story = document.querySelector("#story-text");
  if (!story) return;

  function decorateEncounterVisuals() {
    story.querySelectorAll(".encounter-visual").forEach((visual) => {
      if (visual.dataset.encounterDecorated === "true") return;

      const id = Object.keys(encounters).find((key) => visual.classList.contains(encounters[key].cssClass));
      if (!id) return;

      const entry = encounters[id];
      visual.dataset.encounterDecorated = "true";

      const card = document.createElement("div");
      card.className = "encounter-card";
      card.innerHTML = `
        <img src="${entry.image}" alt="${entry.name}" width="220" height="220" decoding="async">
        <div class="encounter-card__body">
          <p class="encounter-card__eyebrow">MATER HOST // PHÂN LOẠI TẠM</p>
          <h3 class="encounter-card__name">${entry.name}</h3>
          <div class="encounter-card__meta">
            <span>Đe dọa: ${entry.threat}</span>
            <span>Khả năng cứu: ${entry.recoverability}</span>
          </div>
          <p class="encounter-card__role">${entry.role}</p>
        </div>
      `;

      visual.replaceChildren(card);
    });
  }

  decorateEncounterVisuals();
  const observer = new MutationObserver(decorateEncounterVisuals);
  observer.observe(story, { childList: true, subtree: true });
}());