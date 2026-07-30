(function () {
  "use strict";

  const SAVE_KEY = "hua-family-libera-1899-v0.1";
  const data = window.HUA_GAME_DATA;

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
    log: document.querySelector("#log-list"),
    save: document.querySelector("#save-button"),
    load: document.querySelector("#load-button"),
    restart: document.querySelector("#restart-button")
  };

  let state = clone(data.initialState);
  let enteredScenes = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function applyEffects(effects) {
    if (!effects) return;

    if (effects.stats) {
      Object.entries(effects.stats).forEach(([key, delta]) => {
        const current = Number(state.stats[key] || 0);
        const upper = key === "evidence" ? 99 : 100;
        state.stats[key] = clamp(current + Number(delta), 0, upper);
      });
    }

    if (effects.flags) {
      Object.assign(state.flags, effects.flags);
    }

    if (effects.log) {
      state.log.unshift(effects.log);
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
    const p = document.createElement("p");
    if (typeof paragraph === "string") {
      p.textContent = paragraph;
    } else {
      p.textContent = paragraph.text;
      if (paragraph.className) p.className = paragraph.className;
    }
    return p;
  }

  function render() {
    const scene = data.scenes[state.sceneId];
    if (!scene) return;

    elements.kicker.textContent = scene.kicker || "HỒ SƠ";
    elements.progress.textContent = String(new Set(state.history.concat(state.sceneId)).size).padStart(2, "0");
    elements.title.textContent = scene.title;
    elements.story.replaceChildren(...scene.paragraphs.map(renderParagraph));
    elements.choices.replaceChildren();

    scene.choices.forEach((choice, index) => {
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

  function selectChoice(choice) {
    if (choice.action === "restart") {
      restartGame();
      return;
    }

    if (choice.next) {
      enterScene(choice.next, choice.effects);
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
      localStorage.setItem(SAVE_KEY, JSON.stringify({ state, enteredScenes: [...enteredScenes] }));
    } catch (error) {
      console.warn("Không thể tự động lưu.", error);
    }
  }

  function saveGame() {
    autoSave();
    state.log.unshift("Tiến trình đã được lưu trên thiết bị.");
    state.log = state.log.slice(0, 7);
    renderStatus();
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        state.log.unshift("Chưa có bản lưu trên thiết bị.");
        renderStatus();
        return;
      }
      const saved = JSON.parse(raw);
      state = saved.state;
      enteredScenes = new Set(saved.enteredScenes || []);
      state.log.unshift("Đã tải bản lưu gần nhất.");
      state.log = state.log.slice(0, 7);
      render();
    } catch (error) {
      console.error(error);
      state.log.unshift("Bản lưu không hợp lệ.");
      renderStatus();
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
  elements.load.addEventListener("click", loadGame);
  elements.restart.addEventListener("click", restartGame);

  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const index = Number(event.key) - 1;
    const buttons = elements.choices.querySelectorAll("button");
    if (Number.isInteger(index) && index >= 0 && buttons[index]) {
      buttons[index].click();
    }
  });

  loadGame();
  render();
}());
