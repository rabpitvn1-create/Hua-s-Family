import { INITIAL_STATE, WORLD_CANON } from "./world-canon.js";

const AUTO_SAVE_KEY = "hua-family-sandbox-v1-auto";
const MANUAL_SAVE_KEY = "hua-family-sandbox-v1-manual";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function cleanText(value, maxLength = 500) {
  return typeof value === "string"
    ? value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function clamp(value, min, max) {
  const numeric = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(numeric) ? Math.round(numeric) : 0));
}

function createStorage() {
  try {
    const probe = "__hua_sandbox_probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch (error) {
    const memory = new Map();
    console.warn("localStorage không khả dụng; dùng bộ nhớ tạm.", error);
    return {
      getItem: (key) => memory.has(key) ? memory.get(key) : null,
      setItem: (key, value) => memory.set(key, String(value)),
      removeItem: (key) => memory.delete(key)
    };
  }
}

function appendUnique(target, values, limit, maxLength = 240) {
  const output = Array.isArray(target) ? target.slice() : [];
  const existing = new Set(output.map((item) => cleanText(item, maxLength).toLowerCase()));
  (Array.isArray(values) ? values : []).forEach((value) => {
    const text = cleanText(value, maxLength);
    const key = text.toLowerCase();
    if (text && !existing.has(key)) {
      output.push(text);
      existing.add(key);
    }
  });
  return output.slice(-limit);
}

function normalizeDialogue(rawDialogue) {
  return (Array.isArray(rawDialogue) ? rawDialogue : [])
    .filter((line) => line && typeof line === "object")
    .map((line) => ({
      speaker: cleanText(line.speaker, 60),
      text: cleanText(line.text, 600)
    }))
    .filter((line) => line.speaker && line.text)
    .slice(0, 6);
}

function normalizeItem(rawItem, fallbackIndex = 0) {
  if (!rawItem || typeof rawItem !== "object") return null;
  const name = cleanText(rawItem.name, 100);
  if (!name) return null;
  const id = cleanText(rawItem.id, 100)
    || `${name.toLowerCase().replace(/[^a-z0-9à-ỹ]+/gi, "-").replace(/^-|-$/g, "")}-${fallbackIndex}`;
  return {
    id,
    name,
    type: cleanText(rawItem.type, 60) || "item",
    rarity: cleanText(rawItem.rarity, 40) || "thường",
    description: cleanText(rawItem.description, 500),
    effect: cleanText(rawItem.effect, 300),
    imagePrompt: cleanText(rawItem.imagePrompt, 1000),
    imageStatus: "pending"
  };
}

function normalizeState(rawState) {
  const base = clone(INITIAL_STATE);
  const candidate = rawState && typeof rawState === "object" ? rawState : {};
  const state = {
    ...base,
    ...candidate,
    scene: { ...base.scene, ...(candidate.scene || {}) },
    stats: { ...base.stats, ...(candidate.stats || {}) },
    flags: { ...base.flags, ...(candidate.flags || {}) },
    campaignCanon: { ...base.campaignCanon, ...(candidate.campaignCanon || {}) },
    inventory: Array.isArray(candidate.inventory) ? candidate.inventory : [],
    log: Array.isArray(candidate.log) ? candidate.log.slice(0, 12) : base.log,
    history: Array.isArray(candidate.history) ? candidate.history.slice(-40) : []
  };

  state.scene.narration = Array.isArray(state.scene.narration)
    ? state.scene.narration.map((item) => cleanText(item, 2500)).filter(Boolean).slice(0, 10)
    : base.scene.narration;
  state.scene.dialogue = normalizeDialogue(state.scene.dialogue);
  state.scene.choices = (Array.isArray(state.scene.choices) ? state.scene.choices : base.scene.choices)
    .map((item) => cleanText(item, 240)).filter(Boolean).slice(0, 3);
  state.inventory = state.inventory.map(normalizeItem).filter(Boolean).slice(-40);
  return state;
}

export function initGame() {
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
    timeMeter: document.querySelector("#time-meter"),
    timeValue: document.querySelector("#time-value"),
    controlMeter: document.querySelector("#control-meter"),
    controlValue: document.querySelector("#control-value"),
    signalMeter: document.querySelector("#signal-meter"),
    signalValue: document.querySelector("#signal-value"),
    evidenceValue: document.querySelector("#evidence-value"),
    routeValue: document.querySelector("#route-value"),
    verificationValue: document.querySelector("#verification-value"),
    contactStyleValue: document.querySelector("#contact-style-value"),
    log: document.querySelector("#log-list"),
    threads: document.querySelector("#threads-list"),
    inventory: document.querySelector("#inventory-list"),
    save: document.querySelector("#save-button"),
    load: document.querySelector("#load-button"),
    restart: document.querySelector("#restart-button")
  };

  const required = [elements.kicker, elements.progress, elements.title, elements.story, elements.choices];
  if (required.some((element) => !element)) {
    document.body.textContent = "Không thể khởi tạo giao diện AI sandbox.";
    return null;
  }

  const storage = createStorage();
  let state = normalizeState(INITIAL_STATE);

  function applyStatEffects(rawEffects) {
    const effects = rawEffects && typeof rawEffects === "object" ? rawEffects : {};
    const bounds = {
      alertDelta: ["alert", -8, 15],
      ritualDelta: ["ritual", -8, 12],
      civilianSafetyDelta: ["civilianSafety", -12, 3],
      evidenceDelta: ["evidence", 0, 2],
      timeDelta: ["time", -15, 3],
      controlDelta: ["control", -12, 12],
      signalRiskDelta: ["signalRisk", -8, 15]
    };

    Object.entries(bounds).forEach(([source, [target, min, max]]) => {
      const delta = clamp(effects[source], min, max);
      const current = Number(state.stats[target]) || 0;
      const upper = target === "evidence" ? 999 : 100;
      state.stats[target] = clamp(current + delta, 0, upper);
    });
  }

  function applyWorldUpdates(rawUpdates) {
    const updates = rawUpdates && typeof rawUpdates === "object" ? rawUpdates : {};
    const canon = state.campaignCanon;
    const currentLocation = cleanText(updates.currentLocation, 160);
    if (currentLocation) state.currentLocation = currentLocation;

    canon.facts = appendUnique(canon.facts, updates.newCanonFacts, 80, 360);
    canon.events = appendUnique(canon.events, [updates.eventSummary], 80, 360);
    canon.unresolvedThreads = appendUnique(canon.unresolvedThreads, updates.newThreads, 30, 260);
    canon.characters = appendUnique(canon.characters, updates.newCharacters, 40, 220);
    canon.locations = appendUnique(canon.locations, updates.newLocations, 40, 220);

    const resolved = (Array.isArray(updates.resolvedThreads) ? updates.resolvedThreads : [])
      .map((item) => cleanText(item, 260)).filter(Boolean);
    if (resolved.length) {
      canon.resolvedThreads = appendUnique(canon.resolvedThreads, resolved, 40, 260);
      const resolvedSet = new Set(resolved.map((item) => item.toLowerCase()));
      canon.unresolvedThreads = canon.unresolvedThreads.filter((item) => !resolvedSet.has(cleanText(item, 260).toLowerCase()));
    }

    const knownItemIds = new Set(state.inventory.map((item) => item.id));
    const items = (Array.isArray(updates.itemsFound) ? updates.itemsFound : [])
      .map(normalizeItem).filter(Boolean);
    items.forEach((item) => {
      if (!knownItemIds.has(item.id)) {
        state.inventory.push(item);
        knownItemIds.add(item.id);
        state.log.unshift(`Nhận vật phẩm: ${item.name}.`);
      }
    });
    state.inventory = state.inventory.slice(-40);
  }

  function applyAiTurn(rawTurn, playerAction) {
    const turn = rawTurn && typeof rawTurn === "object" ? rawTurn : {};
    const updates = turn.worldUpdates && typeof turn.worldUpdates === "object" ? turn.worldUpdates : {};
    const narration = cleanText(turn.narration, 7000);
    const choices = (Array.isArray(turn.choices) ? turn.choices : [])
      .map((item) => cleanText(item, 240)).filter(Boolean).slice(0, 3);

    if (!narration || choices.length !== 3) {
      throw new Error("Lượt AI không có đủ lời kể và ba gợi ý hành động.");
    }

    applyStatEffects(turn.effects);
    applyWorldUpdates(updates);

    state.turn += 1;
    state.scene = {
      id: `turn-${state.turn}`,
      kicker: cleanText(updates.sceneKicker, 100) || `LƯỢT ${state.turn}`,
      title: cleanText(updates.sceneTitle, 180) || "Tình thế mới",
      narration: narration.split(/\n{2,}/).map((item) => cleanText(item, 2500)).filter(Boolean).slice(0, 10),
      dialogue: normalizeDialogue(turn.dialogue),
      choices
    };

    const action = cleanText(playerAction, 600);
    const summary = cleanText(turn.summary, 360) || cleanText(updates.eventSummary, 360) || `Lượt ${state.turn} đã hoàn tất.`;
    state.history.push({
      turn: state.turn,
      action,
      summary,
      location: state.currentLocation,
      sceneTitle: state.scene.title
    });
    state.history = state.history.slice(-40);
    state.log.unshift(`Lượt ${state.turn}: ${summary}`);
    state.log = state.log.slice(0, 12);
    autoSave();
    render();
    return getSnapshot();
  }

  function getSnapshot() {
    return {
      version: state.version,
      campaignId: state.campaignId,
      worldId: WORLD_CANON.id,
      turn: state.turn,
      scene: clone(state.scene),
      currentLocation: state.currentLocation,
      stats: clone(state.stats),
      flags: clone(state.flags),
      campaignCanon: clone(state.campaignCanon),
      inventory: clone(state.inventory),
      recentHistory: clone(state.history.slice(-12)),
      log: clone(state.log.slice(0, 12))
    };
  }

  function renderParagraph(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }

  function renderDialogue(line) {
    const paragraph = document.createElement("p");
    paragraph.className = "dialogue";
    const speaker = document.createElement("span");
    speaker.className = "speaker";
    speaker.textContent = line.speaker;
    const text = document.createElement("span");
    text.textContent = line.text;
    paragraph.append(speaker, text);
    return paragraph;
  }

  function renderChoices() {
    elements.choices.replaceChildren();
    state.scene.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      const number = document.createElement("span");
      number.className = "choice-number";
      number.textContent = String(index + 1);
      const label = document.createElement("span");
      label.textContent = choice;
      button.append(number, label);
      button.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("hua:use-suggestion", { detail: { choice } }));
      });
      elements.choices.append(button);
    });
  }

  function setMeter(meter, label, value) {
    if (meter) meter.value = value;
    if (label) label.textContent = `${value}%`;
  }

  function renderList(element, items, emptyText) {
    if (!element) return;
    element.replaceChildren();
    const source = items.length ? items : [emptyText];
    source.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      element.append(li);
    });
  }

  function renderInventory() {
    if (!elements.inventory) return;
    elements.inventory.replaceChildren();
    if (!state.inventory.length) {
      const li = document.createElement("li");
      li.textContent = "Chưa có vật phẩm phát sinh.";
      elements.inventory.append(li);
      return;
    }
    state.inventory.slice(-10).forEach((item) => {
      const li = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = `${item.name} — ${item.rarity}`;
      const description = document.createElement("span");
      description.textContent = item.description ? ` ${item.description}` : "";
      li.append(name, description);
      elements.inventory.append(li);
    });
  }

  function render() {
    elements.kicker.textContent = state.scene.kicker;
    elements.progress.textContent = String(state.turn).padStart(2, "0");
    elements.title.textContent = state.scene.title;
    elements.story.replaceChildren(
      ...state.scene.narration.map(renderParagraph),
      ...state.scene.dialogue.map(renderDialogue)
    );
    renderChoices();

    setMeter(elements.alertMeter, elements.alertValue, state.stats.alert);
    setMeter(elements.ritualMeter, elements.ritualValue, state.stats.ritual);
    setMeter(elements.civilianMeter, elements.civilianValue, state.stats.civilianSafety);
    setMeter(elements.timeMeter, elements.timeValue, state.stats.time);
    setMeter(elements.controlMeter, elements.controlValue, state.stats.control);
    setMeter(elements.signalMeter, elements.signalValue, state.stats.signalRisk);
    if (elements.evidenceValue) elements.evidenceValue.textContent = state.stats.evidence;
    if (elements.routeValue) elements.routeValue.textContent = state.currentLocation;
    if (elements.verificationValue) elements.verificationValue.textContent = String(state.turn);
    if (elements.contactStyleValue) elements.contactStyleValue.textContent = state.currentLocation;

    renderList(elements.log, state.log, "Chưa có sự kiện.");
    renderList(elements.threads, state.campaignCanon.unresolvedThreads.slice(0, 8), "Chưa có đầu mối đang mở.");
    renderInventory();
    document.title = `${state.scene.title} — Hứa Gia: LIBERA-1899`;
    window.dispatchEvent(new CustomEvent("hua:game-rendered", { detail: getSnapshot() }));
  }

  function autoSave() {
    try {
      storage.setItem(AUTO_SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Không thể tự động lưu chiến dịch.", error);
    }
  }

  function saveGame() {
    storage.setItem(MANUAL_SAVE_KEY, JSON.stringify(state));
    state.log.unshift("Đã tạo bản lưu thủ công.");
    state.log = state.log.slice(0, 12);
    render();
  }

  function loadGame() {
    const raw = storage.getItem(MANUAL_SAVE_KEY) || storage.getItem(AUTO_SAVE_KEY);
    if (!raw) {
      state.log.unshift("Chưa có bản lưu AI sandbox.");
      render();
      return;
    }
    try {
      state = normalizeState(JSON.parse(raw));
      state.log.unshift("Đã tải chiến dịch AI sandbox.");
      state.log = state.log.slice(0, 12);
      render();
    } catch (error) {
      console.error(error);
      state = normalizeState(INITIAL_STATE);
      state.log.unshift("Bản lưu hỏng; đã tạo chiến dịch mới.");
      render();
    }
  }

  function restartGame() {
    state = normalizeState(INITIAL_STATE);
    storage.removeItem(AUTO_SAVE_KEY);
    state.log.unshift("Đã xóa dòng truyện phát sinh và khởi tạo chiến dịch mới.");
    autoSave();
    render();
  }

  elements.save?.addEventListener("click", saveGame);
  elements.load?.addEventListener("click", loadGame);
  elements.restart?.addEventListener("click", restartGame);

  window.HUA_GAME_BRIDGE = Object.freeze({
    getSnapshot,
    applyAiTurn,
    saveGame,
    loadGame,
    restartGame
  });

  const auto = storage.getItem(AUTO_SAVE_KEY);
  if (auto) {
    try {
      state = normalizeState(JSON.parse(auto));
    } catch {
      state = normalizeState(INITIAL_STATE);
    }
  }
  render();
  return window.HUA_GAME_BRIDGE;
}
