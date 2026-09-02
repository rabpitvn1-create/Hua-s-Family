import {
  hasNativeAiBridge,
  getNativeAiConfiguration,
  openNativeApiKeySettings,
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
    keySettings: document.querySelector("#ai-api-keys"),
    note: document.querySelector("#ai-note")
  };

  if (!elements.status || !elements.action || !elements.submit || !elements.clear || !elements.note) return;

  const nativeMode = hasNativeAiBridge();
  let nativeConfigured = false;
  let busy = false;

  function setStatus(text, kind = "idle") {
    elements.status.textContent = text;
    elements.status.dataset.kind = kind;
  }

  function isUnavailable() {
    return !nativeMode || !nativeConfigured;
  }

  function setBusy(value) {
    busy = value;
    const unavailable = isUnavailable();
    elements.submit.disabled = value || unavailable;
    elements.action.disabled = value || unavailable;
    elements.clear.disabled = value;
    if (elements.keySettings) elements.keySettings.disabled = value;
  }

  function refreshNativeConfiguration() {
    if (!nativeMode) return;
    const configuration = getNativeAiConfiguration();
    const keyCount = Math.max(0, Number(configuration?.apiKeyCount) || 0);
    nativeConfigured = Boolean(configuration?.apiReady && keyCount > 0);

    if (nativeConfigured) {
      setStatus(`APK sẵn sàng · ${keyCount} key`, "ready");
      elements.note.textContent = `APK gọi Gemini trực tiếp và luân phiên ${keyCount} API key đã mã hóa trên thiết bị.`;
    } else {
      setStatus("Chưa có API key", "warning");
      elements.note.textContent = "Mở Cấu hình API key, dán mỗi Gemini API key trên một dòng rồi lưu.";
    }
    setBusy(busy);
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

  async function submitAction() {
    if (busy) return;
    const action = cleanText(elements.action.value, 600);
    if (!action) {
      setStatus("Hãy nhập hành động", "warning");
      elements.action.focus();
      return;
    }

    if (!nativeMode) {
      setStatus("Chỉ hỗ trợ APK Android", "error");
      elements.note.textContent = "Backend web đã bị loại bỏ. AI chỉ chạy qua cầu nối native trong APK.";
      return;
    }

    if (!nativeConfigured) {
      setStatus("Chưa có API key", "error");
      elements.note.textContent = "Mở Cấu hình API key để thêm ít nhất một Gemini API key.";
      openNativeApiKeySettings();
      return;
    }

    setBusy(true);
    setStatus("Gemini đang dùng nhóm API key…", "busy");

    try {
      const payload = await runNativeCampaignTurn(bridge.getSnapshot(), action);
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

  if (elements.keySettings) {
    elements.keySettings.hidden = !nativeMode;
    elements.keySettings.addEventListener("click", () => openNativeApiKeySettings());
  }

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
    window.__huaApiKeysChanged = refreshNativeConfiguration;
    refreshNativeConfiguration();
  } else {
    setStatus("Chỉ hỗ trợ APK Android", "warning");
    elements.note.textContent = "Bản web/backend legacy đã bị loại bỏ. Hãy build và cài APK Android để chơi với Gemini.";
  }

  setBusy(false);
}
