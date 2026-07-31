import { existsSync, readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const gradle = readFileSync("android/app/build.gradle.kts", "utf8");

const requiredIds = [
  "scene-kicker", "scene-progress", "scene-title", "story-text", "choices",
  "alert-meter", "alert-value", "ritual-meter", "ritual-value",
  "civilian-meter", "civilian-value", "time-meter", "time-value",
  "control-meter", "control-value", "signal-meter", "signal-value",
  "lan-trust-meter", "lan-trust-value", "memory-meter", "memory-value",
  "party-meter", "party-value", "evidence-value", "route-value",
  "verification-value", "contact-style-value", "campaign-stage-value",
  "objective-progress-value", "backrooms-floor-value", "supplies-value",
  "ammunition-value", "clues-value", "saved-value", "log-list",
  "threads-list", "inventory-list", "save-button", "load-button",
  "restart-button", "ai-status", "ai-output", "ai-narration",
  "ai-dialogue", "ai-suggestions", "ai-action", "ai-submit", "ai-clear",
  "ai-note", "ai-api-keys", "intel-panel", "intel-toggle", "focus-toggle"
];

const idMatches = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = idMatches.filter((id, index) => idMatches.indexOf(id) !== index);
if (duplicates.length) {
  throw new Error(`ID bị trùng trong index.html: ${[...new Set(duplicates)].join(", ")}`);
}

const missingIds = requiredIds.filter((id) => !idMatches.includes(id));
if (missingIds.length) {
  throw new Error(`UI thiếu ID bắt buộc: ${missingIds.join(", ")}`);
}

const stylesheetPaths = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
  .map((match) => match[1]);
const missingStyles = stylesheetPaths.filter((path) => !existsSync(path));
if (missingStyles.length) {
  throw new Error(`Không tìm thấy stylesheet: ${missingStyles.join(", ")}`);
}

const scriptPaths = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const missingScripts = scriptPaths.filter((path) => !existsSync(path));
if (missingScripts.length) {
  throw new Error(`Không tìm thấy script giao diện: ${missingScripts.join(", ")}`);
}

const localImages = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path) => !/^https?:|^data:/i.test(path));
const missingImages = localImages.filter((path) => !existsSync(path));
if (missingImages.length) {
  throw new Error(`Không tìm thấy asset hình ảnh: ${missingImages.join(", ")}`);
}

for (const path of stylesheetPaths) {
  if (!gradle.includes(`include("${path}")`)) {
    throw new Error(`APK chưa đóng gói stylesheet ${path}.`);
  }
}

if (localImages.some((path) => path.startsWith("assets/")) && !gradle.includes('include("assets/**")')) {
  throw new Error("APK chưa đóng gói thư mục assets/**.");
}

if (html.includes("iphone-ui.css")) {
  throw new Error("index.html vẫn còn nạp lớp typography cũ.");
}

console.log(
  `UI integrity check passed: ${requiredIds.length} required IDs, `
  + `${stylesheetPaths.length} stylesheets, ${localImages.length} local images.`
);
