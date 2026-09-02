import { readFileSync } from "node:fs";
import {
  ACTIVE_CHARACTER_PROMPT_CANON,
  IRIS_CODEX,
  KAI_CODEX,
  SYVIAL_CODEX
} from "../src/active-character-codex.js";
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
  KAI_CODEX.identity.organization.startsWith("SRU / Special Response Unit"),
  "Kai phải thuộc SRU trong canon hiện hành."
);
assert(KAI_CODEX.identity.publicRecordSpecies === "Human", "Hồ sơ công khai của Kai phải là Human.");
assert(KAI_CODEX.identity.position === "Đội trưởng", "Kai phải là Đội trưởng SRU.");
assert(KAI_CODEX.identity.combatTier === "UR+", "Kai phải giữ cấp UR+.");
assert(KAI_CODEX.equipment.currentWeapons.includes("SRU-MK20"), "Kai phải có SRU-MK20.");
assert(KAI_CODEX.equipment.currentWeapons.includes("SRU-SG"), "Kai phải có SRU-SG.");
assert(
  KAI_CODEX.combat.guiltyCrownOverride.some((line) => line.includes("đúng 24 phát")),
  "Guilty Crown Override phải khóa đúng 24 phát."
);

assert(IRIS_CODEX.identity.name === "Iris", "Amy phải được thay bằng Iris trong character canon.");
assert(IRIS_CODEX.identity.codename === "ARGUS", "Iris phải dùng mật danh ARGUS.");
assert(
  IRIS_CODEX.identity.organization.startsWith("CHƯA KHÓA"),
  "Không được tự gán tổ chức mới cho Iris khi canon hiện hành chưa khóa."
);
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

const promptCanonText = JSON.stringify(ACTIVE_CHARACTER_PROMPT_CANON);
for (const forbidden of [
  "Amy / Delta",
  "MAGNUM GHOST",
  "Unlimited Gun Works",
  "White Wraith Magnum",
  "Blackblood Armor",
  "Black Blood",
  "Huyết Nha"
]) {
  assert(!promptCanonText.includes(forbidden), `Prompt canon không được còn legacy token: ${forbidden}`);
}
assert(promptCanonText.includes("Special Response Unit"), "Prompt canon phải truyền SRU cho Kai.");
assert(promptCanonText.includes("SRU-MK20"), "Prompt canon phải truyền SRU-MK20.");
assert(promptCanonText.includes("SRU-SG"), "Prompt canon phải truyền SRU-SG.");

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
assert(promptSource.includes("ACTIVE_CHARACTER_PROMPT_CANON"), "Gemini prompt phải nạp character canon hiện hành.");
assert(promptSource.includes("characters: ACTIVE_CHARACTER_PROMPT_CANON"), "Director canon phải truyền character canon hiện hành.");
assert(promptSource.includes("CHARACTER CANON:"), "Writer prompt phải nhận character canon hiện hành.");
assert(!promptSource.includes("black-blood-character-codex"), "Gemini prompt không được import module tổ chức legacy.");

console.log("Character canon check passed: Kai=SRU, Iris/Syvial organization remains explicitly unlocked.");
