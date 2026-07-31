const STAGES = Object.freeze([
  { id: "long_hai", label: "Hồi 1 · Long Hải" },
  { id: "can_gio", label: "Hồi 2 · Cần Giờ" },
  { id: "backrooms", label: "Hồi 3 · Backrooms 1900" },
  { id: "thu_dau_mot", label: "Hồi 4 · Thủ Dầu Một" },
  { id: "vung_tau", label: "Hồi 5 · Vũng Tàu" },
  { id: "sai_gon_cho_lon", label: "Hồi 6 · Sài Gòn–Chợ Lớn" }
]);

const THREAT_COPY = Object.freeze({
  low: {
    label: "Hiện trường đang kín",
    footer: "Mức can thiệp: kín · không để lại công nghệ thế kỷ 29.",
    caption: "Cảm biến chỉ ghi nhận nhiễu nền quanh khu vực hiện tại."
  },
  watch: {
    label: "Dấu hiệu ký sinh tăng",
    footer: "Mức can thiệp: theo dõi · giữ đường rút và phân loại vật chủ.",
    caption: "Dấu sinh học đã rõ hơn nhưng chưa đủ dữ kiện để định danh."
  },
  critical: {
    label: "Nguy cơ nghi lễ cao",
    footer: "Mức can thiệp: khẩn · ưu tiên mục tiêu bảo hộ và dân thường.",
    caption: "Tiếp xúc có khả năng xảy ra ngay trong cảnh hiện tại."
  }
});

function numberOr(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isTypingTarget(target) {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || Boolean(target?.isContentEditable);
}

function threatFromSnapshot(snapshot) {
  const stats = snapshot?.stats || {};
  const campaign = snapshot?.campaignStats || {};
  const score = Math.max(
    numberOr(stats.alert),
    numberOr(stats.ritual),
    numberOr(stats.signalRisk),
    numberOr(campaign.lanMaterInfluence),
    100 - numberOr(stats.civilianSafety, 100),
    100 - numberOr(campaign.memoryIntegrity, 100)
  );

  if (score >= 68) return { level: "critical", score };
  if (score >= 36) return { level: "watch", score };
  return { level: "low", score };
}

function routePercent(snapshot) {
  const progression = snapshot?.progression || {};
  const stageIndex = clamp(numberOr(progression.stageIndex), 0, STAGES.length - 1);
  let subProgress = 0.08;

  if (progression.stageId === "backrooms") {
    subProgress = clamp((numberOr(progression.backroomsFloor, -1) + 1) / 16, 0, 1);
  } else if (progression.campaignComplete) {
    subProgress = 1;
  }

  const denominator = Math.max(1, STAGES.length - 1);
  return clamp(((stageIndex + subProgress) / denominator) * 100, 2, 100);
}

export function initMissionInterface() {
  const body = document.body;
  const intelPanel = document.querySelector("#intel-panel");
  const intelToggle = document.querySelector("#intel-toggle");
  const intelClose = document.querySelector("#intel-close");
  const intelScrim = document.querySelector("#intel-scrim");
  const focusToggle = document.querySelector("#focus-toggle");
  const storyPanel = document.querySelector("#story-panel");
  const routeProgress = document.querySelector("#route-progress");
  const routeStepLabel = document.querySelector("#route-step-label");
  const threatLabel = document.querySelector("#threat-label");
  const footerThreatCopy = document.querySelector("#footer-threat-copy");
  const encounterMonitor = document.querySelector("#encounter-monitor");
  const encounterTitle = document.querySelector("#encounter-title");
  const encounterCaption = document.querySelector("#encounter-caption");
  const lanHealth = document.querySelector("#lan-health-rail");
  const lanInfluence = document.querySelector("#lan-influence-rail");
  const routeItems = [...document.querySelectorAll("[data-route-stage]")];
  const actionInput = document.querySelector("#ai-action");
  const mobilePanelQuery = window.matchMedia("(max-width: 1020px)");
  let lastSceneId = "";
  let sceneAnimationTimer = 0;

  if (window.HuaAndroid) body.classList.add("native-apk");

  function syncIntelAccessibility() {
    const isMobile = mobilePanelQuery.matches;
    const isOpen = body.classList.contains("intel-open");
    if (intelPanel) intelPanel.setAttribute("aria-hidden", String(isMobile && !isOpen));
    if (intelToggle) intelToggle.setAttribute("aria-expanded", String(isMobile ? isOpen : true));
    if (intelScrim) intelScrim.tabIndex = isMobile && isOpen ? 0 : -1;
  }

  function setIntelOpen(value) {
    body.classList.toggle("intel-open", Boolean(value) && mobilePanelQuery.matches);
    syncIntelAccessibility();
    if (value && mobilePanelQuery.matches) {
      window.setTimeout(() => intelClose?.focus(), 50);
    } else if (!value && mobilePanelQuery.matches) {
      intelToggle?.focus({ preventScroll: true });
    }
  }

  function setFocusMode(value) {
    const enabled = Boolean(value);
    body.classList.toggle("focus-mode", enabled);
    focusToggle?.setAttribute("aria-pressed", String(enabled));
    try {
      window.localStorage.setItem("hua-ui-focus-mode", enabled ? "1" : "0");
    } catch {
      // Giao diện vẫn hoạt động khi localStorage bị chặn.
    }
  }

  function animateScene(sceneId) {
    if (!storyPanel || !sceneId || sceneId === lastSceneId) return;
    lastSceneId = sceneId;
    window.clearTimeout(sceneAnimationTimer);
    storyPanel.classList.remove("is-entering");
    void storyPanel.offsetWidth;
    storyPanel.classList.add("is-entering");
    sceneAnimationTimer = window.setTimeout(() => {
      storyPanel.classList.remove("is-entering");
    }, 620);
  }

  function syncRoute(snapshot) {
    const stageId = String(snapshot?.progression?.stageId || "long_hai");
    const activeIndex = Math.max(0, STAGES.findIndex((stage) => stage.id === stageId));
    body.dataset.stage = stageId;

    routeItems.forEach((item, index) => {
      item.classList.toggle("is-active", item.dataset.routeStage === stageId);
      item.classList.toggle("is-complete", index < activeIndex);
    });

    const stage = STAGES[activeIndex] || STAGES[0];
    if (routeStepLabel) {
      const floor = stageId === "backrooms"
        ? ` · tầng ${clamp(numberOr(snapshot?.progression?.backroomsFloor, 0), 0, 15)}`
        : "";
      routeStepLabel.textContent = `${stage.label}${floor}`;
    }
    if (routeProgress) routeProgress.style.width = `${routePercent(snapshot).toFixed(1)}%`;
  }

  function syncThreat(snapshot) {
    const threat = threatFromSnapshot(snapshot);
    const copy = THREAT_COPY[threat.level];
    body.dataset.threat = threat.level;
    if (threatLabel) threatLabel.textContent = copy.label;
    if (footerThreatCopy) footerThreatCopy.textContent = copy.footer;

    const active = threat.score >= 42;
    encounterMonitor?.classList.toggle("is-active", active);
    if (encounterTitle) {
      encounterTitle.textContent = active
        ? String(snapshot?.scene?.title || "Dấu hiệu chưa định danh")
        : "Không có tiếp xúc trực diện";
    }
    if (encounterCaption) encounterCaption.textContent = copy.caption;
  }

  function syncTarget(snapshot) {
    if (lanHealth) lanHealth.textContent = `${clamp(numberOr(snapshot?.campaignStats?.lanHealth, 100), 0, 100)}%`;
    if (lanInfluence) lanInfluence.textContent = `${clamp(numberOr(snapshot?.campaignStats?.lanMaterInfluence), 0, 100)}%`;
  }

  function sync(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return;
    syncRoute(snapshot);
    syncThreat(snapshot);
    syncTarget(snapshot);
    animateScene(String(snapshot?.scene?.id || `turn-${numberOr(snapshot?.turn)}`));
  }

  function resizeActionInput() {
    if (!(actionInput instanceof HTMLTextAreaElement)) return;
    actionInput.style.height = "auto";
    actionInput.style.height = `${clamp(actionInput.scrollHeight, 112, 260)}px`;
  }

  intelToggle?.addEventListener("click", () => {
    if (mobilePanelQuery.matches) {
      setIntelOpen(!body.classList.contains("intel-open"));
    } else {
      intelPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  intelClose?.addEventListener("click", () => setIntelOpen(false));
  intelScrim?.addEventListener("click", () => setIntelOpen(false));
  focusToggle?.addEventListener("click", () => setFocusMode(!body.classList.contains("focus-mode")));
  mobilePanelQuery.addEventListener?.("change", () => {
    if (!mobilePanelQuery.matches) body.classList.remove("intel-open");
    syncIntelAccessibility();
  });
  actionInput?.addEventListener("input", resizeActionInput);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("intel-open")) {
      event.preventDefault();
      setIntelOpen(false);
      return;
    }

    if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;

    if (/^[1-3]$/.test(event.key)) {
      const choice = document.querySelectorAll("#choices .choice")[Number(event.key) - 1];
      if (choice instanceof HTMLButtonElement) {
        event.preventDefault();
        choice.click();
      }
    } else if (event.key.toLowerCase() === "i") {
      event.preventDefault();
      setIntelOpen(!body.classList.contains("intel-open"));
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      setFocusMode(!body.classList.contains("focus-mode"));
    }
  });

  window.addEventListener("hua:game-rendered", (event) => sync(event.detail));

  try {
    setFocusMode(window.localStorage.getItem("hua-ui-focus-mode") === "1");
  } catch {
    setFocusMode(false);
  }
  syncIntelAccessibility();
  resizeActionInput();

  return Object.freeze({ sync, setIntelOpen, setFocusMode });
}
