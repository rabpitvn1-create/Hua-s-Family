(function () {
  "use strict";

  const AUTO_SAVE_KEY = "hua-family-libera-1899-v0.2-auto";
  const MANUAL_SAVE_KEY = "hua-family-libera-1899-v0.2-manual";
  const LEGACY_SAVE_KEY = "hua-family-libera-1899-v0.1";
  const data = window.HUA_GAME_DATA;
  const storage = createStorage();

  if (!data || !data.scenes || !data.initialState) {
    document.body.textContent = "Không thể tải dữ liệu truyện.";
    return;
  }

  const elements = {
    kicker: document.querySelector("#scene-kicker"),
    progress: document.querySelector("#scene-progress"),
    title: document.querySelector("#scene-title"),
    story: document.querySelector("#story-text"),
    choices: document.querySelector("#choices"),
    alertMeter: document.querySelector("#alert-meter"),
    alertValue: document.querySelector("#alert-value"),
    ritualMeter: document.querySelector("#ritual-meter"),
    ritualValue: document.querySelector("#ritual-value"),
    civilianMeter: document.querySelector("#civilian-meter"),
    civilianValue: document.querySelector("#civilian-value"),
    evidenceValue: document.querySelector("#evidence-value"),
    routeValue: document.querySelector("#route-value"),
    contactSection: document.querySelector("#contact-status"),
    timeMeter: document.querySelector("#time-meter"),
    timeValue: document.querySelector("#time-value"),
    controlMeter: document.querySelector("#control-meter"),
    controlValue: document.querySelector("#control-value"),
    signalMeter: document.querySelector("#signal-meter"),
    signalValue: document.querySelector("#signal-value"),
    verificationValue: document.querySelector("#verification-value"),
    contactStyleValue: document.querySelector("#contact-style-value"),
    log: document.querySelector("#log-list"),
    save: document.querySelector("#save-button"),
    load: document.querySelector("#load-button"),
    restart: document.querySelector("#restart-button")
  };

  const limits = {
    alert: [0, 100],
    ritual: [0, 100],
    civilianSafety: [0, 100],
    evidence: [0, 99],
    time: [0, 100],
    verification: [0, 4],
    control: [0, 100],
    signalRisk: [0, 100]
  };

  let state = clone(data.initialState);
  let enteredScenes = new Set();

  function createStorage() {
    try {
      const probe = "__hua_storage_probe__";
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch (error) {
      const memory = new Map();
      console.warn("localStorage không khả dụng; dùng bộ nhớ tạm cho phiên hiện tại.", error);
      return {
        getItem: (key) => memory.has(key) ? memory.get(key) : null,
        setItem: (key, value) => memory.set(key, String(value)),
        removeItem: (key) => memory.delete(key),
        clear: () => memory.clear()
      };
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function resolve(value) {
    return typeof value === "function" ? value(state) : value;
  }

  function normalizeState(savedState) {
    const base = clone(data.initialState);
    const candidate = savedState && typeof savedState === "object" ? savedState : {};

    return {
      ...base,
      ...candidate,
      stats: { ...base.stats, ...(candidate.stats || {}) },
      flags: { ...base.flags, ...(candidate.flags || {}) },
      log: Array.isArray(candidate.log) ? candidate.log.slice(0, 7) : base.log,
      history: Array.isArray(candidate.history) ? candidate.history : base.history
    };
  }

  function applyEffects(rawEffects) {
    const effects = resolve(rawEffects);
    if (!effects) return;

    if (effects.stats) {
      Object.entries(effects.stats).forEach(([key, delta]) => {
        const current = Number(state.stats[key] || 0);
        const [min, max] = limits[key] || [0, 100];
        state.stats[key] = clamp(current + Number(delta), min, max);
      });
    }

    if (effects.setStats) {
      Object.entries(effects.setStats).forEach(([key, value]) => {
        const [min, max] = limits[key] || [0, 100];
        state.stats[key] = clamp(Number(value), min, max);
      });
    }

    if (effects.flags) {
      Object.assign(state.flags, effects.flags);
    }

    if (effects.log) {
      const entries = Array.isArray(effects.log) ? effects.log : [effects.log];
      state.log.unshift(...entries);
      state.log = state.log.slice(0, 7);
    }
  }

  function enterScene(sceneId, effects) {
    const nextScene = data.scenes[sceneId];
    if (!nextScene) {
      console.error(`Scene không tồn tại: ${sceneId}`);
      return;
    }

    applyEffects(effects);
    state.history.push(state.sceneId);
    state.sceneId = sceneId;

    if (!enteredScenes.has(sceneId) && nextScene.onEnter) {
      applyEffects(nextScene.onEnter);
      enteredScenes.add(sceneId);
    }

    autoSave();
    render();
  }

  function renderParagraph(paragraph) {
    if (typeof paragraph === "string") {
      const p = document.createElement("p");
      p.textContent = paragraph;
      return p;
    }

    const p = document.createElement("p");
    if (paragraph.type === "dialogue") {
      p.className = "dialogue";
      const speaker = document.createElement("span");
      speaker.className = "speaker";
      speaker.textContent = paragraph.speaker || "";
      const text = document.createElement("span");
      text.textContent = paragraph.text || "";
      p.append(speaker, text);
      return p;
    }

    p.textContent = paragraph.text || "";
    if (paragraph.className) p.className = paragraph.className;
    return p;
  }

  function render() {
    const scene = data.scenes[state.sceneId];
    if (!scene) return;

    const paragraphs = resolve(scene.paragraphs) || [];
    const rawChoices = resolve(scene.choices) || [];
    const choices = rawChoices.filter((choice) => !choice.condition || resolve(choice.condition));

    elements.kicker.textContent = scene.kicker || "HỒ SƠ";
    elements.progress.textContent = String(new Set(state.history.concat(state.sceneId)).size).padStart(2, "0");
    elements.title.textContent = scene.title;
    elements.story.replaceChildren(...paragraphs.map(renderParagraph));
    elements.choices.replaceChildren();

    choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.innerHTML = `<span class="choice-number">${index + 1}</span><span>${escapeHtml(choice.label)}${choice.hint ? `<small>${escapeHtml(choice.hint)}</small>` : ""}</span>`;
      button.addEventListener("click", () => selectChoice(choice));
      elements.choices.append(button);
    });

    renderStatus();
    document.title = `${scene.title} — Hứa Gia: LIBERA-1899`;
  }

  function renderStatus() {
    setMeter(elements.alertMeter, elements.alertValue, state.stats.alert);
    setMeter(elements.ritualMeter, elements.ritualValue, state.stats.ritual);
    setMeter(elements.civilianMeter, elements.civilianValue, state.stats.civilianSafety);
    elements.evidenceValue.textContent = state.stats.evidence;
    elements.routeValue.textContent = state.flags.route;

    const contactVisible = Boolean(state.flags.contactStarted);
    elements.contactSection.hidden = !contactVisible;
    if (contactVisible) {
      setMeter(elements.timeMeter, elements.timeValue, state.stats.time);
      elements.controlMeter.value = state.stats.control;
      elements.controlValue.textContent = controlLabel(state.stats.control);
      setMeter(elements.signalMeter, elements.signalValue, state.stats.signalRisk);
      elements.verificationValue.textContent = `${state.stats.verification}/3`;
      elements.contactStyleValue.textContent = state.flags.contactStyle;
    }

    elements.log.replaceChildren();
    state.log.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      elements.log.append(li);
    });
  }

  function setMeter(meter, label, value) {
    meter.value = value;
    label.textContent = `${value}%`;
  }

  function controlLabel(value) {
    if (value >= 65) return `Kai +${value - 50}`;
    if (value <= 35) return `Tiểu Lan +${50 - value}`;
    return "Giằng co";
  }

  function selectChoice(choice) {
    if (choice.action === "restart") {
      restartGame();
      return;
    }

    const next = resolve(choice.next);
    if (next) {
      enterScene(next, choice.effects);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function autoSave() {
    try {
      storage.setItem(AUTO_SAVE_KEY, JSON.stringify({ state, enteredScenes: [...enteredScenes] }));
    } catch (error) {
      console.warn("Không thể tự động lưu.", error);
    }
  }

  function saveGame() {
    try {
      storage.setItem(MANUAL_SAVE_KEY, JSON.stringify({ state, enteredScenes: [...enteredScenes] }));
      state.log.unshift("Đã tạo bản lưu thủ công trên thiết bị.");
      state.log = state.log.slice(0, 7);
      renderStatus();
    } catch (error) {
      console.warn("Không thể tạo bản lưu thủ công.", error);
      state.log.unshift("Không thể tạo bản lưu thủ công.");
      renderStatus();
    }
  }

  function readSavedPayload(preferManual) {
    const keys = preferManual
      ? [MANUAL_SAVE_KEY, AUTO_SAVE_KEY, LEGACY_SAVE_KEY]
      : [AUTO_SAVE_KEY, MANUAL_SAVE_KEY, LEGACY_SAVE_KEY];

    for (const key of keys) {
      const raw = storage.getItem(key);
      if (raw) return { raw, legacy: key === LEGACY_SAVE_KEY, manual: key === MANUAL_SAVE_KEY };
    }

    return null;
  }

  function loadGame(preferManual = true) {
    try {
      const payload = readSavedPayload(preferManual);
      if (!payload) {
        state.log.unshift("Chưa có bản lưu trên thiết bị.");
        renderStatus();
        return;
      }

      const saved = JSON.parse(payload.raw);
      state = normalizeState(saved.state);
      enteredScenes = new Set(saved.enteredScenes || []);

      if (payload.legacy && state.sceneId === "slice_end") {
        state.sceneId = "door";
        state.flags.contactStarted = false;
        enteredScenes.delete("door");
      }

      const notice = payload.legacy
        ? "Đã chuyển bản lưu 0.1 sang chương tiếp xúc."
        : payload.manual
          ? "Đã tải bản lưu thủ công."
          : "Đã tải tiến trình tự động gần nhất.";
      state.log.unshift(notice);
      state.log = state.log.slice(0, 7);
      autoSave();
      render();
    } catch (error) {
      console.error(error);
      state = clone(data.initialState);
      enteredScenes = new Set();
      state.log.unshift("Bản lưu không hợp lệ; đã khởi tạo dòng thời gian mới.");
      render();
    }
  }

  function restartGame() {
    state = clone(data.initialState);
    state.log.unshift("Dòng thời gian được khởi tạo lại.");
    enteredScenes = new Set();
    autoSave();
    render();
  }

  elements.save.addEventListener("click", saveGame);
  elements.load.addEventListener("click", () => loadGame(true));
  elements.restart.addEventListener("click", restartGame);

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = Number(event.key) - 1;
    const buttons = elements.choices.querySelectorAll("button");
    if (Number.isInteger(index) && index >= 0 && buttons[index]) {
      buttons[index].click();
    }
  });

  loadGame(false);
  render();
}());
