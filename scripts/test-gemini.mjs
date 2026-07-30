const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!apiKey) {
  throw new Error("Thiếu GEMINI_API_KEY.");
}

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: "Trả về trạng thái sẵn sàng cho text game bằng JSON." }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 80,
        thinkingConfig: { thinkingLevel: "minimal" },
        responseFormat: {
          text: {
            mimeType: "application/json",
            schema: {
              type: "object",
              properties: {
                ready: { type: "boolean" },
                model: { type: "string" }
              },
              required: ["ready", "model"]
            }
          }
        }
      }
    })
  }
);

const raw = await response.text();
if (!response.ok) {
  throw new Error(`Gemini API trả lỗi ${response.status}: ${raw}`);
}

const payload = JSON.parse(raw);
const text = payload?.candidates?.[0]?.content?.parts
  ?.filter((part) => typeof part.text === "string" && !part.thought)
  .map((part) => part.text)
  .join("");

if (!text) {
  throw new Error(`Gemini không trả về nội dung: ${raw}`);
}

const result = JSON.parse(text);
if (result.ready !== true) {
  throw new Error(`Phản hồi kiểm tra không hợp lệ: ${text}`);
}

console.log(`Gemini API sẵn sàng. Model: ${model}.`);
