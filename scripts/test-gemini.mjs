import { runCampaignTurn } from "../api/gemini-pipeline.js";
import { INITIAL_STATE } from "../src/world-canon.js";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Thiếu GEMINI_API_KEY.");
}

const sampleAction = "Kai dùng cảm biến kiểm tra dấu bùn và luồng hàng quanh bếp, chưa tiếp xúc trực tiếp với gia nhân.";

const output = await runCampaignTurn(INITIAL_STATE, sampleAction);
const result = output?.result;

if (!result || typeof result !== "object") {
  throw new Error("Pipeline Gemini không trả về kết quả.");
}

if (typeof result.narration !== "string" || result.narration.trim().length < 80) {
  throw new Error("Model viết văn trả lời kể quá ngắn hoặc không hợp lệ.");
}

if (!Array.isArray(result.choices) || result.choices.length !== 3) {
  throw new Error("Pipeline không trả đúng ba lựa chọn.");
}

if (!result.effects || !result.campaignEffects || !result.worldUpdates) {
  throw new Error("Model đạo diễn thiếu hậu quả hoặc cập nhật thế giới.");
}

if (String(output.writerModel).toLowerCase().includes("lite")) {
  throw new Error(`Model Lite không được phép viết văn: ${output.writerModel}`);
}

console.log(
  `Pipeline Gemini sẵn sàng. Đạo diễn: ${output.directorModel}; viết văn: ${output.writerModel}; `
  + `lời kể ${result.narration.length} ký tự.`
);
