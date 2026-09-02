import { existsSync, readFileSync } from "node:fs";

const forbiddenPaths = [
  "vercel.json",
  ".env.example",
  ".github/workflows/gemini-smoke-test.yml",
  ".github/workflows/pages.yml",
  "api",
  "scripts/test-gemini.mjs",
  "docs/DEPLOYMENT_NEXT.md"
];

const leftovers = forbiddenPaths.filter(existsSync);
if (leftovers.length) {
  throw new Error(`Standalone APK vẫn còn legacy deployment: ${leftovers.join(", ")}`);
}

for (const required of [
  "apk-ai/gemini-prompts.js",
  "apk-ai/gemini-schemas.js",
  "apk-ai/gemini-state.js"
]) {
  if (!existsSync(required)) throw new Error(`Thiếu module APK: ${required}`);
}

const gameMaster = readFileSync("src/ai-game-master.js", "utf8");
for (const token of ["/api/gemini-turn", "HUA_GEMINI_ENDPOINT", "requestWebTurn"]) {
  if (gameMaster.includes(token)) {
    throw new Error(`Game master vẫn còn web backend fallback: ${token}`);
  }
}

const packageJson = readFileSync("package.json", "utf8");
for (const token of ["vercel dev", "test:gemini"]) {
  if (packageJson.includes(token)) {
    throw new Error(`package.json vẫn còn deployment/backend legacy: ${token}`);
  }
}

const gitignore = readFileSync(".gitignore", "utf8");
for (const token of [".vercel/", "!.env.example"]) {
  if (gitignore.includes(token)) {
    throw new Error(`.gitignore vẫn còn legacy entry: ${token}`);
  }
}

const geminiSetup = readFileSync("docs/GEMINI_SETUP.md", "utf8");
for (const token of [
  "/api/gemini-turn",
  "HUA_GEMINI_ENDPOINT",
  "npm run test:gemini",
  "Trong project Vercel"
]) {
  if (geminiSetup.includes(token)) {
    throw new Error(`Tài liệu Gemini vẫn hướng dẫn backend legacy: ${token}`);
  }
}

const nativePipeline = readFileSync("src/native-ai-pipeline.js", "utf8");
for (const modulePath of [
  "../apk-ai/gemini-prompts.js",
  "../apk-ai/gemini-schemas.js",
  "../apk-ai/gemini-state.js"
]) {
  if (!nativePipeline.includes(modulePath)) {
    throw new Error(`Native pipeline chưa dùng module đóng gói: ${modulePath}`);
  }
}

const gradle = readFileSync("android/app/build.gradle.kts", "utf8");
if (!gradle.includes('include("apk-ai/**")')) {
  throw new Error("Gradle chưa đóng gói apk-ai/** vào APK.");
}

const activity = readFileSync(
  "android/app/src/main/java/com/rabpity/huafamily/MainActivity.kt",
  "utf8"
);
if (!activity.includes("appassets.androidplatform.net/assets/www/index.html")) {
  throw new Error("MainActivity không khởi động từ web assets đóng gói trong APK.");
}

console.log("Standalone APK check passed: no web deployment backend required.");
