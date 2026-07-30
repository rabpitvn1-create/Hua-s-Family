(function () {
  "use strict";

  const bridge = window.HUA_GAME_BRIDGE;
  if (!bridge) return;

  const elements = {
    panel: document.querySelector("#ai-game-master"),
    status: document.querySelector("#ai-status"),
    output: document.querySelector("#ai-output"),
    narration: document.querySelector("#ai-narration"),
    dialogue: document.querySelector("#ai-dialogue"),
    suggestions: document.querySelector("#ai-suggestions"),
    action: document.querySelector("#ai-action"),
    submit: document.querySelector("#ai-submit"),
    clear: document.querySelector("#ai-clear"),
    note: document.querySelector("#ai-note")
  };

  if (Object.values(elements).some((element) => !element)) return;

  const STORAGE_KEY = "hua-family-gemini-branches-v1";
  const configuredEndpoint = typeof window.HUA_GEMINI_ENDPOINT === "string"
    ? window.HUA_GEMINI_ENDPOINT.trim()
    : "";
  const isGitHubPages = window.location.hostname.endsWith("github.io");
  const endpoint = configuredEndpoint || "/api/gemini-turn";

  let activeSceneId = "";
  let recentTurns = [];
  let busy = false;

  function createStorage() {
    try {
      const probe = "__hua_ai_storage_probe__";
      window.localStorage.setItem(probe, probe);
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch (error) {
      console.warn("Không thể lưu nhánh AI trên thiết bị.", error);
      return null;
    }
  }

  const storage = createStorage();

  function readBranches() {
    if (!storage) return {};
    try {
      const raw = storage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      console.warn("Bản lưu nhánh AI không hợp lệ.", error);
      return {};
    }
  }

  function saveCurrentBranch() {
    if (!storage || !activeSceneId) return;
    const branches = readBranches();
    branches[activeSceneId] = recentTurns.slice(-6);
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(branches));
    } catch (error) {
      console.warn("Không thể lưu nhánh AI.", error);
    }
  }

  function setBusy(value) {
    busy = value;
    elements.submit.disabled = value || (isGitHubPages && !configuredEndpoint);
    elements.clear.disabled = value;
    elements.action.disabled = value || (isGitHubPages && !configuredEndpoint);
  }

  function setStatus(text, kind = "idle") {
    elements.status.textContent = text;
    elements.status.dataset.kind = kind;
  }

  function clearRenderedTurn() {
    elements.output.hidden = true;
    elements.narration.replaceChildren();
    elements.dialogue.replaceChildren();
    elements.suggestions.replaceChildren();
  }

  function renderDialogue(dialogue) {
    elements.dialogue.replaceChildren();
    dialogue.forEach((line) => {
      const row = document.createElement("p");
      row.className = "ai-dialogue-line";

      const speaker = document.createElement("strong");
      speaker.textContent = line.speaker;

      const text = document.createElement("span");
      text.textContent = line.text;

      row.append(speaker, text);
      elements.dialogue.append(row);
    });
  }

  function renderSuggestions(choices) {
    elements.suggestions.replaceChildren();
    choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ai-suggestion";
      button.textContent = choice;
      button.addEventListener("click", () => {
        elements.action.value = choice;
        elements.action.focus();
      });
      elements.suggestions.append(button);
    });
  }

  function normalizeTurn(payload) {
    const dialogue = Array.isArray(payload?.dialogue)
      ? payload.dialogue
          .filter((line) => line && typeof line.speaker === "string" && typeof line.text === "string")
          .slice(0, 4)
          .map((line) => ({ speaker: line.speaker.slice(0, 60), text: line.text.slice(0, 500) }))
      : [];

    const choices = Array.isArray(payload?.choices)
      ? payload.choices.filter((choice) => typeof choice === "string").slice(0, 3).map((choice) => choice.slice(0, 220))
      : [];

    return {
      narration: typeof payload?.narration === "string" ? payload.narration.trim().slice(0, 5000) : "",
      dialogue,
      choices,
      effects: payload?.effects && typeof payload.effects === "object" ? payload.effects : {},
      summary: typeof payload?.summary === "string" ? payload.summary.trim().slice(0, 300) : ""
    };
  }

  function renderTurn(turn) {
    clearRenderedTurn();

    turn.narration.split(/\n{2,}/).filter(Boolean).forEach((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph.trim();
      elements.narration.append(p);
    });

    renderDialogue(turn.dialogue);
    renderSuggestions(turn.choices);
    elements.output.hidden = false;
  }

  function activateScene(sceneId) {
    if (!sceneId || sceneId === activeSceneId) return;
    activeSceneId = sceneId;

    const branches = readBranches();
    recentTurns = Array.isArray(branches[sceneId]) ? branches[sceneId].slice(-6) : [];
    elements.action.value = "";

    const lastTurn = recentTurns.at(-1)?.result;
    if (lastTurn) {
      renderTurn(normalizeTurn(lastTurn));
      setStatus("Đã khôi phục nhánh AI", "ready");
    } else {
      clearRenderedTurn();
      setStatus(isGitHubPages && !configuredEndpoint ? "Chưa có backend" : "Sẵn sàng", isGitHubPages && !configuredEndpoint ? "warning" : "ready");
    }
  }

  function clearBranch() {
    recentTurns = [];
    if (storage && activeSceneId) {
      const branches = readBranches();
      delete branches[activeSceneId];
      storage.setItem(STORAGE_KEY, JSON.stringify(branches));
    }
    elements.action.value = "";
    clearRenderedTurn();
    setStatus(isGitHubPages && !configuredEndpoint ? "Chưa có backend" : "Đã xóa nhánh AI", isGitHubPages && !configuredEndpoint ? "warning" : "ready");
  }

  async function submitAction() {
    if (busy) return;

    const action = elements.action.value.replace(/\s+/g, " ").trim();
    if (!action) {
      setStatus("Hãy nhập hành động", "warning");
      elements.action.focus();
      return;
    }

    if (isGitHubPages && !configuredEndpoint) {
      setStatus("GitHub Pages không chạy được API", "error");
      elements.note.textContent = "Mã Gemini đã được tích hợp, nhưng bản GitHub Pages cần một backend riêng. Triển khai repository trên Vercel rồi thêm GEMINI_API_KEY vào Environment Variables.";
      return;
    }

    setBusy(true);
    setStatus("Gemini đang xử lý…", "busy");

    try {
      const snapshot = bridge.getSnapshot();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          state: snapshot,
          recentTurns: recentTurns.slice(-4).map((turn) => ({
            action: turn.action,
            summary: turn.result?.summary || "",
            narration: turn.result?.narration || ""
          }))
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Backend trả lỗi ${response.status}.`);
      }

      const turn = normalizeTurn(payload);
      if (!turn.narration || turn.choices.length !== 3) {
        throw new Error("Gemini trả về lượt chơi chưa đúng cấu trúc.");
      }

      bridge.applyAiOutcome(turn.effects, turn.summary);
      recentTurns.push({ action, result: turn });
      recentTurns = recentTurns.slice(-6);
      saveCurrentBranch();
      renderTurn(turn);
      elements.action.value = "";
      setStatus("Đã xử lý", "ready");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Không thể gọi Gemini.";
      setStatus(message, "error");
    } finally {
      setBusy(false);
    }
  }

  elements.submit.addEventListener("click", submitAction);
  elements.clear.addEventListener("click", clearBranch);
  elements.action.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submitAction();
    }
  });

  window.addEventListener("hua:scene-rendered", (event) => {
    activateScene(event.detail?.sceneId);
  });

  const initialSnapshot = bridge.getSnapshot();
  activateScene(initialSnapshot.sceneId);
  setBusy(false);

  if (isGitHubPages && !configuredEndpoint) {
    elements.note.textContent = "GitHub Pages chỉ phục vụ file tĩnh nên không đọc được GEMINI_API_KEY. Hãy triển khai cùng repository trên Vercel để bật quản trò AI an toàn.";
  }
}());
