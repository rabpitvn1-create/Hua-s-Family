const WRITER_MODEL = process.env.GEMINI_WRITER_MODEL
  || process.env.GEMINI_MODEL
  || "gemini-3.6-flash";

const DIRECTOR_MODELS = (process.env.GEMINI_DIRECTOR_MODELS
  || `${process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash-lite"},${WRITER_MODEL}`)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const WRITER_MODELS = (process.env.GEMINI_WRITER_MODELS || WRITER_MODEL)
  .split(",")
  .map((model) => model.trim())
  .filter((model) => model && !model.toLowerCase().includes("lite"));

export const DIRECTOR_MODEL_CANDIDATES = [...new Set(DIRECTOR_MODELS)];
export const WRITER_MODEL_CANDIDATES = [...new Set(
  WRITER_MODELS.length ? WRITER_MODELS : ["gemini-3.6-flash"]
)];

export const DIRECTOR_RETRIES = Math.min(
  3,
  Math.max(1, Number(process.env.GEMINI_DIRECTOR_RETRY_ATTEMPTS)
    || Number(process.env.GEMINI_RETRY_ATTEMPTS)
    || 2)
);

export const WRITER_RETRIES = Math.min(
  3,
  Math.max(1, Number(process.env.GEMINI_WRITER_RETRY_ATTEMPTS)
    || Number(process.env.GEMINI_RETRY_ATTEMPTS)
    || 2)
);

export const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const SWITCHABLE_STATUSES = new Set([404, ...RETRYABLE_STATUSES]);

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(attempt) {
  return 650 * (2 ** attempt) + Math.floor(Math.random() * 300);
}

function buildRequestBody({
  model,
  prompt,
  systemInstruction,
  schema,
  maxOutputTokens,
  thinkingLevel
}) {
  return {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens,
      thinkingConfig: {
        thinkingLevel: thinkingLevel
          || (model.toLowerCase().includes("lite") ? "minimal" : "low")
      },
      responseMimeType: "application/json",
      responseJsonSchema: schema
    }
  };
}

async function requestModel({
  model,
  prompt,
  systemInstruction,
  schema,
  maxOutputTokens,
  retries,
  thinkingLevel
}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let lastFailure = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify(buildRequestBody({
          model,
          prompt,
          systemInstruction,
          schema,
          maxOutputTokens,
          thinkingLevel
        }))
      });

      const raw = await response.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = {};
      }

      if (response.ok) return { model, payload };

      const message = payload?.error?.message || `Gemini API trả lỗi ${response.status}.`;
      lastFailure = { status: response.status, message };
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === retries - 1) break;
      await sleep(retryDelay(attempt));
    } catch (error) {
      lastFailure = {
        status: 502,
        message: error instanceof Error ? error.message : "Không thể kết nối Gemini API."
      };
      if (attempt === retries - 1) break;
      await sleep(retryDelay(attempt));
    }
  }

  throw Object.assign(
    new Error(lastFailure?.message || "Gemini không phản hồi."),
    { status: lastFailure?.status || 502 }
  );
}

export async function requestFromCandidates({
  models,
  prompt,
  systemInstruction,
  schema,
  maxOutputTokens,
  retries,
  thinkingLevel,
  roleLabel
}) {
  let lastError = null;

  for (const model of models) {
    try {
      return await requestModel({
        model,
        prompt,
        systemInstruction,
        schema,
        maxOutputTokens,
        retries,
        thinkingLevel
      });
    } catch (error) {
      lastError = error;
      if (!SWITCHABLE_STATUSES.has(Number(error?.status))) throw error;
    }
  }

  throw lastError || new Error(`Không có model ${roleLabel} khả dụng.`);
}

function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((part) => typeof part?.text === "string" && !part.thought)
    .map((part) => part.text)
    .join("")
    .trim();
}

export function parseModelJson(payload, label) {
  const outputText = extractText(payload);
  if (!outputText) {
    const reason = payload?.candidates?.[0]?.finishReason
      || payload?.promptFeedback?.blockReason
      || "không rõ";
    throw new Error(`${label} không trả về nội dung hợp lệ (${reason}).`);
  }

  try {
    return JSON.parse(outputText);
  } catch {
    throw new Error(`${label} trả về JSON không đọc được.`);
  }
}
