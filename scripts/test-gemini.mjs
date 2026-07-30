const apiKey = process.env.GEMINI_API_KEY;
const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash-lite")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const models = [...new Set([primaryModel, ...fallbackModels])];
const retryableStatuses = new Set([408, 429, 500, 502, 503, 504]);

if (!apiKey) {
  throw new Error("Thiếu GEMINI_API_KEY.");
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildBody(model) {
  return {
    contents: [
      {
        role: "user",
        parts: [{ text: "Trả về trạng thái sẵn sàng cho text game bằng JSON." }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 80,
      thinkingConfig: {
        thinkingLevel: model.includes("lite") ? "minimal" : "low"
      },
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          ready: { type: "boolean" },
          model: { type: "string" }
        },
        required: ["ready", "model"]
      }
    }
  };
}

async function callModel(model) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(buildBody(model))
    });

    const raw = await response.text();
    if (response.ok) {
      const payload = JSON.parse(raw);
      const text = payload?.candidates?.[0]?.content?.parts
        ?.filter((part) => typeof part.text === "string" && !part.thought)
        .map((part) => part.text)
        .join("");

      if (!text) {
        throw new Error(`Gemini không trả về nội dung với model ${model}: ${raw}`);
      }

      const result = JSON.parse(text);
      if (result.ready !== true) {
        throw new Error(`Phản hồi kiểm tra không hợp lệ từ ${model}: ${text}`);
      }

      return model;
    }

    lastError = new Error(`Gemini ${model} trả lỗi ${response.status}: ${raw}`);
    if (!retryableStatuses.has(response.status) || attempt === 1) break;
    await sleep(700 + Math.floor(Math.random() * 250));
  }

  throw lastError || new Error(`Không thể gọi Gemini model ${model}.`);
}

let lastError = null;
for (const model of models) {
  try {
    const workingModel = await callModel(model);
    console.log(`Gemini API sẵn sàng. Model hoạt động: ${workingModel}.`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(error instanceof Error ? error.message : String(error));
  }
}

throw lastError || new Error("Không có Gemini model nào hoạt động.");
