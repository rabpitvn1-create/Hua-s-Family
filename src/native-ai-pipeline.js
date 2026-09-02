import { getDirectorContext } from "./campaign-canon.js";
import { sanitizeLegacyCanonState } from "./canon-migration.js";
import { buildWriterContext } from "./prose-style-guide.js";
import {
  DIRECTOR_SCHEMA,
  WRITER_SCHEMA
} from "../apk-ai/gemini-schemas.js";
import {
  cleanText,
  normalizeState,
  normalizePlan,
  normalizeProse,
  buildFinalResult,
  compactWriterState
} from "../apk-ai/gemini-state.js";
import {
  buildDirectorSystemInstruction,
  buildWriterSystemInstruction
} from "../apk-ai/gemini-prompts.js";

const pendingRequests = new Map();
let sequence = 0;

function installNativeCallbacks() {
  if (typeof window === "undefined") return;

  window.__huaNativeResolve = (requestId, payload) => {
    const request = pendingRequests.get(requestId);
    if (!request) return;
    pendingRequests.delete(requestId);
    clearTimeout(request.timeout);
    request.resolve(payload);
  };

  window.__huaNativeReject = (requestId, message) => {
    const request = pendingRequests.get(requestId);
    if (!request) return;
    pendingRequests.delete(requestId);
    clearTimeout(request.timeout);
    request.reject(new Error(String(message || "Gemini API trả lỗi.")));
  };
}

installNativeCallbacks();

export function hasNativeAiBridge() {
  return typeof window !== "undefined"
    && window.HuaAndroid
    && typeof window.HuaAndroid.generate === "function";
}

export function getNativeAiConfiguration() {
  if (!hasNativeAiBridge()) return null;
  try {
    return JSON.parse(window.HuaAndroid.getConfiguration());
  } catch {
    return null;
  }
}

export function openNativeApiKeySettings() {
  if (!hasNativeAiBridge() || typeof window.HuaAndroid.openApiKeySettings !== "function") return false;
  window.HuaAndroid.openApiKeySettings();
  return true;
}

function parseJson(text, label) {
  const source = String(text || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(source);
  } catch {
    throw new Error(`${label} trả về JSON không đọc được.`);
  }
}

function invokeNativeModel({ model, systemInstruction, prompt, schema, maxOutputTokens }) {
  if (!hasNativeAiBridge()) {
    return Promise.reject(new Error("APK chưa có cầu nối Gemini API."));
  }

  const requestId = `hua-${Date.now()}-${sequence += 1}`;
  const schemaInstruction = `${systemInstruction}\n\nJSON SCHEMA BẮT BUỘC:\n${JSON.stringify(schema)}`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingRequests.delete(requestId);
      reject(new Error("Gemini API phản hồi quá thời gian."));
    }, 170000);

    pendingRequests.set(requestId, { resolve, reject, timeout });

    try {
      window.HuaAndroid.generate(
        requestId,
        model,
        schemaInstruction,
        prompt,
        maxOutputTokens
      );
    } catch (error) {
      clearTimeout(timeout);
      pendingRequests.delete(requestId);
      reject(error instanceof Error ? error : new Error("Không thể gọi cầu nối Android."));
    }
  });
}

export async function runNativeCampaignTurn(rawState, rawAction) {
  const configuration = getNativeAiConfiguration();
  if (!configuration?.apiReady) {
    throw new Error("APK chưa có Gemini API key. Hãy mở Cấu hình API key.");
  }

  const action = cleanText(rawAction, 600);
  if (!action) throw new Error("Bạn chưa nhập hành động.");

  const state = normalizeState(sanitizeLegacyCanonState(rawState));
  const directorContext = getDirectorContext(state);
  const directorPrompt = JSON.stringify({
    task: "Lập kế hoạch logic cho đúng một lượt tiếp theo. Không viết văn hoàn chỉnh.",
    playerAction: action,
    currentCampaignState: state,
    currentDirectorContext: directorContext
  });

  const directorText = await invokeNativeModel({
    model: configuration.directorModel,
    systemInstruction: buildDirectorSystemInstruction(directorContext),
    prompt: directorPrompt,
    schema: DIRECTOR_SCHEMA,
    maxOutputTokens: 3000
  });

  const plan = normalizePlan(parseJson(directorText, "Model đạo diễn"), state);
  const writerContext = buildWriterContext(state, directorContext, plan);
  const writerPrompt = JSON.stringify({
    task: "Viết lời kể, lời thoại và đúng ba lựa chọn từ kế hoạch đã khóa. Không thay đổi sự kiện hay hậu quả.",
    playerAction: action,
    lockedScenePlan: plan,
    compactCampaignState: compactWriterState(state),
    writerContext
  });

  const writerText = await invokeNativeModel({
    model: configuration.writerModel,
    systemInstruction: buildWriterSystemInstruction(writerContext),
    prompt: writerPrompt,
    schema: WRITER_SCHEMA,
    maxOutputTokens: 2200
  });

  const prose = normalizeProse(parseJson(writerText, "Model viết văn"), plan);
  return buildFinalResult(plan, prose);
}
