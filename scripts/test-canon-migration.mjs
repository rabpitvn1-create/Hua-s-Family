import { existsSync, readFileSync } from "node:fs";
import {
  KAI_CODEX,
  IRIS_CODEX,
  SYVIAL_CODEX
} from "../src/active-character-codex.js";
import { SRU_CODEX } from "../src/sru-codex.js";
import { INITIAL_STATE, WORLD_CANON } from "../src/world-canon.js";
import {
  containsLegacyCanonText,
  sanitizeLegacyCanonState,
  stripLegacyFlags
} from "../src/canon-migration.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(!existsSync("src/elysium-agent-codex.js"), "Codex tổ chức/nhân vật cũ phải bị xóa khỏi runtime.");

const runtimeSources = [
  "src/campaign-canon.js",
  "src/world-canon.js",
  "src/dialogue-avatars.js",
  "apk-ai/gemini-prompts.js"
];
const runtimeText = runtimeSources
  .map((path) => `${path}\n${readFileSync(path, "utf8")}`)
  .join("\n");

for (const forbidden of [
  "Phantom",
  "Elysium",
  "MAGNUM GHOST",
  "Unlimited Gun Works",
  "Ten Absolute Pistol Arts",
  "PHANTOM'S RING",
  "Boundless Mind's Eye",
  "Ontological Judgment",
  "Amy / Delta",
  "Amy/Delta",
  "Koei"
]) {
  assert(!runtimeText.includes(forbidden), `Runtime canon còn token legacy: ${forbidden}`);
}

const html = readFileSync("index.html", "utf8");
assert(!html.includes("Phantom"), "UI không được còn mật danh cũ.");
assert(!html.includes("ELYSIUM //"), "UI không được còn nhãn tổ chức cũ.");
assert(html.includes("Kai Akechi"), "UI phải hiển thị tên Kai Akechi.");
assert(html.includes("Twilight"), "UI phải hiển thị mật danh Twilight.");
assert(html.includes("SRU // SPECIAL RESPONSE UNIT"), "UI phải hiển thị SRU.");

assert(WORLD_CANON.characters.kai === KAI_CODEX, "World canon phải dùng trực tiếp KAI_CODEX hiện hành.");
assert(WORLD_CANON.characters.iris === IRIS_CODEX, "World canon phải dùng trực tiếp IRIS_CODEX hiện hành.");
assert(WORLD_CANON.characters.syvial === SYVIAL_CODEX, "World canon phải dùng trực tiếp SYVIAL_CODEX hiện hành.");
assert(WORLD_CANON.organizations.sru === SRU_CODEX, "World canon phải dùng trực tiếp SRU_CODEX hiện hành.");

const generationRules = WORLD_CANON.generationRules.join("\n");
for (const required of [
  "Sparda Core",
  "Guilty Crown Override",
  "SRU-MK20",
  "SRU-SG",
  "Omnivault Ring",
  "Ivory/Ebony",
  "Thousandfold Cognition",
  "ARGUS Terrain Read",
  "GodKiller",
  "Twenty-Four Severance"
]) {
  assert(generationRules.includes(required), `Generation rules thiếu năng lực/loadout hiện hành: ${required}`);
}

for (const removedFlag of [
  "phantomRingAvailable",
  "unlimitedGunWorksAvailable",
  "elysiumContactAvailable",
  "amyDeployed",
  "koeiDeployed"
]) {
  assert(!(removedFlag in INITIAL_STATE.flags), `Initial state còn flag legacy: ${removedFlag}`);
}

const migratedFlags = stripLegacyFlags({
  phantomRingAvailable: true,
  amyDeployed: true,
  futureValidFlag: 7
});
assert(!("phantomRingAvailable" in migratedFlags), "Migration phải loại flag trang bị cũ.");
assert(!("amyDeployed" in migratedFlags), "Migration phải loại flag nhân vật cũ.");
assert(migratedFlags.futureValidFlag === 7, "Migration không được xóa flag tương lai không liên quan.");

const legacyState = sanitizeLegacyCanonState({
  flags: { koeiDeployed: true, currentFlag: true },
  scene: {
    narration: ["Một kỹ năng cũ Unlimited Gun Works xuất hiện.", "Cảnh hiện hành sạch."],
    dialogue: [
      { speaker: "Amy", text: "Dòng legacy." },
      { speaker: "Hứa Tiểu Lan", text: "Dòng hợp lệ." }
    ],
    choices: ["Dùng MAGNUM GHOST.", "Quan sát lối đi."]
  },
  campaignCanon: {
    facts: ["Phantom dùng trang bị cũ.", "Tiểu Lan chưa biết sự thật."],
    events: [],
    unresolvedThreads: [],
    resolvedThreads: [],
    characters: ["Koei", "Hứa Tiểu Lan"],
    locations: ["Long Hải"]
  },
  history: [
    { summary: "Elysium gửi lệnh cũ.", sceneTitle: "Cũ" },
    { summary: "Tiểu Lan rời phòng.", sceneTitle: "Kho thuốc" }
  ]
});

assert(!legacyState.flags.koeiDeployed, "Migration phải bỏ flag legacy trong save cũ.");
assert(legacyState.flags.currentFlag === true, "Migration phải giữ flag hợp lệ.");
assert(legacyState.scene.narration.length === 1 && legacyState.scene.narration[0] === "Cảnh hiện hành sạch.", "Migration phải lọc narration legacy.");
assert(legacyState.scene.dialogue.length === 1 && legacyState.scene.dialogue[0].speaker === "Hứa Tiểu Lan", "Migration phải lọc dialogue legacy.");
assert(legacyState.campaignCanon.facts.length === 1, "Migration phải lọc canon fact legacy.");
assert(legacyState.campaignCanon.characters.length === 1, "Migration phải lọc nhân vật legacy.");
assert(legacyState.history.length === 1, "Migration phải lọc history legacy trước khi gửi model.");
assert(containsLegacyCanonText("Unlimited Gun Works"), "Guard phải nhận diện kỹ năng legacy.");
assert(!containsLegacyCanonText("Guilty Crown Override"), "Guard không được loại kỹ năng hiện hành.");

const promptSource = readFileSync("apk-ai/gemini-prompts.js", "utf8");
assert(!promptSource.includes("LEGACY_CHARACTER_RULE_PREFIXES"), "Prompt không được cần blacklist legacy sau migration.");
assert(!promptSource.includes("withoutLegacyCharacterRules"), "Prompt không được lọc chữa cháy nguồn canon bẩn.");
assert(promptSource.includes("characters: ACTIVE_CHARACTER_PROMPT_CANON"), "Director phải dùng active character canon.");
assert(promptSource.includes("organizations: { sru: SRU_PROMPT_CANON }"), "Director phải dùng SRU canon.");

console.log("Canon migration check passed: runtime uses only active character/SRU sources and old-save legacy data is filtered before AI.");
