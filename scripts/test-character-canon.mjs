import { readFileSync } from "node:fs";
import {
  BLACK_BLOOD_PROMPT_CANON,
  IRIS_CODEX,
  KAI_CODEX,
  SYVIAL_CODEX
} from "../src/black-blood-character-codex.js";
import {
  PROSE_STYLE_GUIDE,
  buildWriterContext
} from "../src/prose-style-guide.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(KAI_CODEX.identity.name === "Kai Akechi", "Kai phải dùng canon Kai Akechi.");
assert(KAI_CODEX.identity.codename === "Twilight", "Kai phải dùng mật danh Twilight.");
assert(
  KAI_CODEX.combat.guiltyCrownOverride.some((line) => line.includes("đúng 24 phát")),
  "Guilty Crown Override phải khóa đúng 24 phát."
);
assert(IRIS_CODEX.identity.name === "Iris", "Amy phải được thay bằng Iris trong character canon.");
assert(IRIS_CODEX.identity.codename === "ARGUS", "Iris phải dùng mật danh ARGUS.");
assert(
  IRIS_CODEX.combat.weapons.some((line) => line.includes("đúng hai khẩu")),
  "Iris phải khóa đúng hai khẩu Ivory và Ebony."
);
assert(SYVIAL_CODEX.identity.name === "Syvial", "Delta phải được thay bằng Syvial trong character canon.");
assert(SYVIAL_CODEX.identity.organization === "CHƯA KHÓA", "Không được tự gán tổ chức cho Syvial.");
assert(
  SYVIAL_CODEX.combat.godKillerOverride.some((line) => line.includes("đúng 24 nhát")),
  "GodKiller Override phải khóa đúng 24 nhát."
);

const promptCanonText = JSON.stringify(BLACK_BLOOD_PROMPT_CANON);
assert(!promptCanonText.includes("Amy / Delta"), "Prompt canon không được còn Amy/Delta.");
assert(!promptCanonText.includes("MAGNUM GHOST"), "Prompt canon không được còn MAGNUM GHOST.");
assert(!promptCanonText.includes("Unlimited Gun Works"), "Prompt canon không được còn Unlimited Gun Works.");

const writerContext = buildWriterContext(
  { progression: { stageId: "long_hai" }, currentLocation: "Long Hải" },
  { stage: { label: "Long Hải" } },
  { dialoguePlan: [{ speaker: "Iris" }, { speaker: "Syvial" }] }
);
const activeVoiceNames = writerContext.activeVoices.map((voice) => voice.name);
assert(activeVoiceNames.includes("Kai Akechi / Twilight"), "Writer phải luôn có voice Kai mới.");
assert(activeVoiceNames.includes("Iris / ARGUS"), "Writer phải nhận diện voice Iris.");
assert(activeVoiceNames.includes("Syvial"), "Writer phải nhận diện voice Syvial.");
assert(!JSON.stringify(PROSE_STYLE_GUIDE.voices).includes("Amy / Delta"), "Voice card không được còn Amy/Delta.");

const promptSource = readFileSync(new URL("../apk-ai/gemini-prompts.js", import.meta.url), "utf8");
assert(promptSource.includes("BLACK_BLOOD_PROMPT_CANON"), "Gemini prompt phải nạp character canon mới.");
assert(promptSource.includes("characters: BLACK_BLOOD_PROMPT_CANON"), "Director canon phải truyền character canon mới.");
assert(promptSource.includes("CHARACTER CANON:"), "Writer prompt phải nhận character canon mới.");

console.log("Character canon check passed: Kai/Iris/Syvial are the active runtime codex.");
