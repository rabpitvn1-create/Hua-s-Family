import {
  hasNativeAiBridge,
  runNativeCampaignTurn
} from "./native-ai-pipeline.js";

function cleanText(value, maxLength = 500) {
  return typeof value === "string"
    ? value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

function cleanProse(value, maxLength = 7000) {
  return typeof value === "string"
    ? value
      .replace(/\u0000/g, "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, maxLength)
    : "";
}

function normalizeTurn(payload) {
  const dialogue = (Array.isArray(payload?.dialogue) ? payload.dialogue : [])
    .filter((line) => line && typeof line === "object")
    .map((line) => ({
      speaker: cleanText(line.speaker, 60),
      text: cleanText(line.text, 600)
    }))
    .filter((line) => line.speaker && line.text)
    .slice(0, 6);

  const choices = (Array.isArray(payload?.choices) ? payload.choices : [])
    .map((choice) => cleanText(choice, 240))
    .filter(Boolean)
    .slice(0, 3);

  return {
    narration: cleanProse(payload?.narration, 7000),
    dialogue,
    choices,
    effects: payload?.effects && typeof payload.effects === "object" ? payload.effects : {},
    campaignEffects: payload?.campaignEffects && typeof payload.campaignEffects === "object"
      ? payload.campaignEffects
      : {},
    progressionUpdate: payload?.progressionUpdate && typeof payload.progressionUpdate === "object"
      ? payload.progressionUpdate
      : {},
    worldUpdates: payload?.worldUpdates && typeof payload.worldUpdates === "object"
      ? payload.worldUpdates
      : {},
    summary: cleanText(payload?.summary, 360)
  };
}

export function initAiGameMaster(bridge = window.HUA_GAME_BRIDGE) {
  if (!bridge) return;

  const elements = {
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

  if (!elements.status || !elements.action || !elements.submit || !elements.clear || !elements.note) return;

  const configuredEndpoint = typeof window.HUA_GEMINI_ENDPOINT === "string"
    ? window.HUA_GEMINI_ENDPOINT.trim()
    : "";
  const nativeMode = hasNativeAiBridge();
  const isGitHubPages = window.location.hostname.endsWith("github.io");
  const endpoint = configuredEndpoint || "/api/gemini-turn";
  let busy = false;

  function setStatus(text, kind = "idle") {
    elements.status.textContent = text;
    elements.status.dataset.kind = kind;
  }

  function isUnavailable() {
    return !nativeMode && isGitHubPages && !configuredEndpoint;
  }

  function setBusy(value) {
    busy = value;
    const unavailable = isUnavailable();
    elements.submit.disabled = value || unavailable;
    elements.action.disabled = value || unavailable;
    elements.clear.disabled = value;
  }

  function renderSuggestions(choices) {
    if (!elements.suggestions) return;
    elements.suggestions.replaceChildren();
    (Array.isArray(choices) ? choices : []).forEach((choice) => {
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

  function renderDialogue(dialogue) {
    if (!elements.dialogue) return;
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

  function renderAppliedTurn(turn) {
    if (!elements.output || !elements.narration || !elements.dialogue) return;
    elements.output.hidden = false;
    elements.narration.replaceChildren();

    const notice = document.createElement("p");
    notice.textContent = turn.summary || "Lượt mới đã được ghi vào cốt truyện chính.";
    elements.narration.append(notice);
    renderDialogue(turn.dialogue);
    renderSuggestions(turn.choices);
  }

  async function requestWebTurn(action) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        state: bridge.getSnapshot()
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || `Backend trả lỗi ${response.status}.`);
    }
    return payload;
  }

  async function submitAction() {
    if (busy) return;
    const action = cleanText(elements.action.value, 600);
    if (!action) {
      setStatus("Hãy nhập hành động", "warning");
      elements.action.focus();
      return;
    }

    if (isUnavailable()) {
      setStatus("GitHub Pages không có backend", "error");
      elements.note.textContent = "Hãy dùng APK Android hoặc cấu hình một backend riêng.";
      return;
    }

    setBusy(true);
    setStatus(
      nativeMode
        ? "Firebase AI đang đạo diễn và biên tập…"
        : "Gemini đang phát triển cốt truyện…",
      "busy"
    );

    try {
      const payload = nativeMode
        ? await runNativeCampaignTurn(bridge.getSnapshot(), action)
        : await requestWebTurn(action);

      const turn = normalizeTurn(payload);
      if (!turn.narration || turn.choices.length !== 3) {
        throw new Error("Gemini trả về lượt chơi chưa đúng cấu trúc.");
      }

      bridge.applyAiTurn(turn, action);
      renderAppliedTurn(turn);
      elements.action.value = "";
      setStatus("Cốt truyện đã cập nhật", "ready");
    } catch (error) {
      console.error(error);
      setStatus(error instanceof Error ? error.message : "Không thể gọi Gemini.", "error");
    } finally {
      setBusy(false);
    }
  }

  elements.submit.addEventListener("click", submitAction);
  elements.clear.addEventListener("click", () => {
    elements.action.value = "";
    elements.action.focus();
    setStatus("Đã xóa ô nhập", "ready");
  });
  elements.action.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submitAction();
    }
  });

  window.addEventListener("hua:use-suggestion", (event) => {
    const choice = cleanText(event.detail?.choice, 240);
    if (!choice) return;
    elements.action.value = choice;
    elements.action.focus();
  });

  window.addEventListener("hua:game-rendered", (event) => {
    renderSuggestions(event.detail?.scene?.choices || []);
  });

  const snapshot = bridge.getSnapshot();
  renderSuggestions(snapshot.scene?.choices || []);

  if (nativeMode) {
    setStatus("APK sẵn sàng", "ready");
    elements.note.textContent = "APK gọi Gemini qua Firebase AI Logic: Flash-Lite xử lý logic, Flash viết văn.";
  } else if (isUnavailable()) {
    setStatus("Chưa có backend", "warning");
    elements.note.textContent = "GitHub Pages chỉ chứa giao diện. Hãy dùng APK Android hoặc cấu hình backend.";
  } else {
    setStatus("Sẵn sàng", "ready");
    elements.note.textContent = "Gemini là đạo diễn cốt truyện chính. Mọi sự kiện được ghi vào canon chiến dịch.";
  }

  setBusy(false);
}
