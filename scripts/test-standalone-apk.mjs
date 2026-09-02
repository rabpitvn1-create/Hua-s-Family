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
  "apk-ai/gemini-state.js",
  "android/app/src/main/java/com/rabpity/huafamily/ApiProviderConfig.kt"
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

const secretNames = [
  "GEMINI_API_KEY",
  "GEMINI_API_KEY_2",
  "GEMINI_API_KEY_3",
  "GEMINI_API_KEY_4",
  "GEMINI_API_KEY_5",
  "OPENROUTER_API_KEY"
];

for (const secretName of secretNames) {
  if (!gradle.includes(`buildConfigField("String", "${secretName}"`)) {
    throw new Error(`Gradle chưa inject provider secret: ${secretName}`);
  }
}

for (const modelConfig of ["GEMINI_FALLBACK_MODELS", "OPENROUTER_MODELS"]) {
  if (!gradle.includes(`buildConfigField("String", "${modelConfig}"`)) {
    throw new Error(`Gradle thiếu model fallback config: ${modelConfig}`);
  }
}

const providerConfig = readFileSync(
  "android/app/src/main/java/com/rabpity/huafamily/ApiProviderConfig.kt",
  "utf8"
);
for (const secretName of secretNames) {
  if (!providerConfig.includes(`BuildConfig.${secretName}`)) {
    throw new Error(`Provider config chưa dùng ${secretName}`);
  }
}

const client = readFileSync(
  "android/app/src/main/java/com/rabpity/huafamily/GeminiApiClient.kt",
  "utf8"
);
const keyLoop = client.indexOf("keyLoop@ for (keyIndex in apiKeys.indices)");
const modelLoop = client.indexOf("for (modelName in safeModels)");
if (keyLoop < 0 || modelLoop < 0 || modelLoop < keyLoop) {
  throw new Error("Gemini routing không còn theo thứ tự key -> model ladder.");
}
for (const token of [
  "shouldFallbackModel",
  "allowProviderFallback",
  "generateOpenRouter",
  "https://openrouter.ai/api/v1/chat/completions"
]) {
  if (!client.includes(token)) {
    throw new Error(`Thiếu provider fallback behavior: ${token}`);
  }
}

const bridge = readFileSync(
  "android/app/src/main/java/com/rabpity/huafamily/NativeGeminiBridge.kt",
  "utf8"
);
for (const token of [
  "ApiProviderConfig.bundledGeminiKeys()",
  "ApiProviderConfig.openRouterKey()",
  "ApiProviderConfig.geminiModelCandidates(modelName)",
  "model-first-six-provider-v2"
]) {
  if (!bridge.includes(token)) {
    throw new Error(`Native bridge thiếu model-first provider routing: ${token}`);
  }
}
if (bridge.includes("advanceAfter(")) {
  throw new Error("Native bridge vẫn round-robin key sau mỗi lần thành công.");
}

const buildWorkflow = readFileSync(".github/workflows/build-android-apk.yml", "utf8");
const releaseWorkflow = readFileSync(".github/workflows/release-android-apk.yml", "utf8");
for (const secretName of secretNames) {
  const reference = `secrets.${secretName}`;
  if (!buildWorkflow.includes(reference)) {
    throw new Error(`Build workflow chưa dùng Hua-s-Family secret: ${secretName}`);
  }
  if (!releaseWorkflow.includes(reference)) {
    throw new Error(`Release workflow chưa dùng Hua-s-Family secret: ${secretName}`);
  }
}

const activity = readFileSync(
  "android/app/src/main/java/com/rabpity/huafamily/MainActivity.kt",
  "utf8"
);
if (!activity.includes("appassets.androidplatform.net/assets/www/index.html")) {
  throw new Error("MainActivity không khởi động từ web assets đóng gói trong APK.");
}
if (!activity.includes("ApiProviderConfig.hasBundledProviders()")) {
  throw new Error("MainActivity chưa ưu tiên provider pool đóng gói.");
}

const sensitiveSources = [gradle, providerConfig, client, bridge, buildWorkflow, releaseWorkflow];
const rawSecretPatterns = [
  /AIza[0-9A-Za-z_-]{20,}/,
  /sk-or-v1-[0-9A-Za-z_-]{20,}/
];
for (const source of sensitiveSources) {
  for (const pattern of rawSecretPatterns) {
    if (pattern.test(source)) {
      throw new Error("Phát hiện giá trị API key literal trong source. Chỉ được tham chiếu GitHub Secrets.");
    }
  }
}

console.log("Standalone APK check passed: model-first six-provider routing is wired without raw secrets in source.");
