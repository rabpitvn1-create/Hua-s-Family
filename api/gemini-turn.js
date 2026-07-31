import {
  RETRYABLE_STATUSES,
  WRITER_MODEL_CANDIDATES
} from "./gemini-client.js";
import { runCampaignTurn } from "./gemini-pipeline.js";

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body !== "string") return null;
  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

function getAllowedOrigin(origin) {
  if (!origin) return "";
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const defaults = [
    "https://rabpitvn1-create.github.io",
    "https://hua-s-family.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];

  return [...configured, ...defaults].includes(origin) ? origin : "";
}

function setCors(req, res) {
  const allowedOrigin = getAllowedOrigin(req.headers?.origin);
  if (allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Chỉ hỗ trợ POST." });

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "Backend chưa có biến môi trường GEMINI_API_KEY." });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "Dữ liệu gửi lên không hợp lệ." });

  try {
    const output = await runCampaignTurn(body.state, body.action);
    res.setHeader("X-Gemini-Director-Model", output.directorModel);
    res.setHeader("X-Gemini-Writer-Model", output.writerModel);
    res.setHeader("X-Prose-Pipeline", "director-writer-v1");
    return res.status(200).json(output.result);
  } catch (error) {
    console.error("Gemini two-stage campaign request failed:", error);
    const status = Number(error?.status);
    const responseStatus = status === 400 ? 400 : status === 429 ? 429 : 502;
    const message = error instanceof Error ? error.message : "Không thể kết nối Gemini API.";

    return res.status(responseStatus).json({
      error: message,
      retryable: RETRYABLE_STATUSES.has(status),
      writerModel: WRITER_MODEL_CANDIDATES[0],
      note: status === 503
        ? "Model viết văn đang quá tải; game không hạ xuống model Lite để tránh giảm chất lượng câu chữ."
        : undefined
    });
  }
}
