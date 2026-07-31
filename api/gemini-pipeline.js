import { getDirectorContext } from "../src/campaign-canon.js";
import { buildWriterContext } from "../src/prose-style-guide.js";
import {
  DIRECTOR_SCHEMA,
  WRITER_SCHEMA
} from "./gemini-schemas.js";
import {
  cleanText,
  normalizeState,
  normalizePlan,
  normalizeProse,
  buildFinalResult,
  compactWriterState
} from "./gemini-state.js";
import {
  DIRECTOR_MODEL_CANDIDATES,
  WRITER_MODEL_CANDIDATES,
  DIRECTOR_RETRIES,
  WRITER_RETRIES,
  requestFromCandidates,
  parseModelJson
} from "./gemini-client.js";
import {
  buildDirectorSystemInstruction,
  buildWriterSystemInstruction
} from "./gemini-prompts.js";

export async function runCampaignTurn(rawState, rawAction) {
  const action = cleanText(rawAction, 600);
  if (!action) {
    throw Object.assign(new Error("Bạn chưa nhập hành động."), { status: 400 });
  }

  const state = normalizeState(rawState);
  const directorContext = getDirectorContext(state);

  const directorPrompt = JSON.stringify({
    task: "Lập kế hoạch logic cho đúng một lượt tiếp theo. Không viết văn hoàn chỉnh.",
    playerAction: action,
    currentCampaignState: state,
    currentDirectorContext: directorContext
  });

  const directorResponse = await requestFromCandidates({
    models: DIRECTOR_MODEL_CANDIDATES,
    prompt: directorPrompt,
    systemInstruction: buildDirectorSystemInstruction(directorContext),
    schema: DIRECTOR_SCHEMA,
    maxOutputTokens: 3000,
    retries: DIRECTOR_RETRIES,
    thinkingLevel: "minimal",
    roleLabel: "đạo diễn"
  });

  const plan = normalizePlan(
    parseModelJson(directorResponse.payload, "Model đạo diễn"),
    state
  );

  const writerContext = buildWriterContext(state, directorContext, plan);
  const writerPrompt = JSON.stringify({
    task: "Viết lời kể, lời thoại và đúng ba lựa chọn từ kế hoạch đã khóa. Không thay đổi sự kiện hay hậu quả.",
    playerAction: action,
    lockedScenePlan: plan,
    compactCampaignState: compactWriterState(state),
    writerContext
  });

  const writerResponse = await requestFromCandidates({
    models: WRITER_MODEL_CANDIDATES,
    prompt: writerPrompt,
    systemInstruction: buildWriterSystemInstruction(writerContext),
    schema: WRITER_SCHEMA,
    maxOutputTokens: 2200,
    retries: WRITER_RETRIES,
    thinkingLevel: "low",
    roleLabel: "viết văn"
  });

  const prose = normalizeProse(
    parseModelJson(writerResponse.payload, "Model viết văn"),
    plan
  );

  return {
    result: buildFinalResult(plan, prose),
    directorModel: directorResponse.model,
    writerModel: writerResponse.model
  };
}
