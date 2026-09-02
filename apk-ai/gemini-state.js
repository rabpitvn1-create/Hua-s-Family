import { getCurrentObjectives } from "../src/campaign-canon.js";
import {
  EFFECT_LIMITS,
  CAMPAIGN_EFFECT_LIMITS
} from "./gemini-schemas.js";

export function cleanText(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/\u0000/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}

export function cleanProse(value, maxLength) {
  return typeof value === "string"
    ? value
      .replace(/\u0000/g, "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, maxLength)
    : "";
}

function clamp(value, min, max) {
  const numeric = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(numeric) ? Math.trunc(numeric) : 0));
}

function cleanStringArray(value, limit, maxLength) {
  return (Array.isArray(value) ? value : [])
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(-limit);
}

function normalizeItem(rawItem) {
  const item = rawItem && typeof rawItem === "object" ? rawItem : {};
  return {
    id: cleanText(item.id, 100),
    name: cleanText(item.name, 100),
    type: cleanText(item.type, 60),
    rarity: cleanText(item.rarity, 40),
    description: cleanText(item.description, 500),
    effect: cleanText(item.effect, 300),
    limitations: cleanText(item.limitations, 300),
    imagePrompt: cleanText(item.imagePrompt, 1000)
  };
}

function normalizeProgression(rawProgression) {
  const progression = rawProgression && typeof rawProgression === "object" ? rawProgression : {};
  return {
    stageId: cleanText(progression.stageId, 60) || "long_hai",
    stageIndex: clamp(progression.stageIndex, 0, 5),
    backroomsFloor: clamp(progression.backroomsFloor, -1, 15),
    completedObjectiveIds: cleanStringArray(progression.completedObjectiveIds, 20, 80),
    backroomsMarks: cleanStringArray(progression.backroomsMarks, 20, 180),
    partySeparated: Boolean(progression.partySeparated),
    campaignComplete: Boolean(progression.campaignComplete)
  };
}

export function normalizeState(rawState) {
  const state = rawState && typeof rawState === "object" ? rawState : {};
  const scene = state.scene && typeof state.scene === "object" ? state.scene : {};
  const stats = state.stats && typeof state.stats === "object" ? state.stats : {};
  const campaignStats = state.campaignStats && typeof state.campaignStats === "object" ? state.campaignStats : {};
  const flags = state.flags && typeof state.flags === "object" ? state.flags : {};
  const canon = state.campaignCanon && typeof state.campaignCanon === "object" ? state.campaignCanon : {};

  return {
    version: cleanText(state.version, 40),
    campaignId: cleanText(state.campaignId, 80),
    turn: clamp(state.turn, 0, 100000),
    currentLocation: cleanText(state.currentLocation, 180),
    progression: normalizeProgression(state.progression),
    scene: {
      title: cleanText(scene.title, 200),
      kicker: cleanText(scene.kicker, 120),
      narration: cleanStringArray(scene.narration, 10, 2600),
      dialogue: (Array.isArray(scene.dialogue) ? scene.dialogue : []).slice(0, 8).map((line) => ({
        speaker: cleanText(line?.speaker, 80),
        text: cleanText(line?.text, 700)
      })),
      choices: cleanStringArray(scene.choices, 3, 260)
    },
    stats: {
      alert: Number(stats.alert) || 0,
      ritual: Number(stats.ritual) || 0,
      civilianSafety: Number(stats.civilianSafety) || 0,
      evidence: Number(stats.evidence) || 0,
      time: Number(stats.time) || 0,
      control: Number(stats.control) || 0,
      signalRisk: Number(stats.signalRisk) || 0
    },
    campaignStats: {
      lanHealth: Number(campaignStats.lanHealth) || 0,
      lanTrust: Number(campaignStats.lanTrust) || 0,
      lanMaterInfluence: Number(campaignStats.lanMaterInfluence) || 0,
      partyHealth: Number(campaignStats.partyHealth) || 0,
      supplies: Number(campaignStats.supplies) || 0,
      ammunition: Number(campaignStats.ammunition) || 0,
      memoryIntegrity: Number(campaignStats.memoryIntegrity) || 0,
      cluesHuaGia: Number(campaignStats.cluesHuaGia) || 0,
      civiliansSaved: Number(campaignStats.civiliansSaved) || 0,
      anchorsDestroyed: Number(campaignStats.anchorsDestroyed) || 0,
      floorsCleared: Number(campaignStats.floorsCleared) || 0,
      falseMemoryCount: Number(campaignStats.falseMemoryCount) || 0
    },
    flags: Object.fromEntries(
      Object.entries(flags).slice(0, 60).map(([key, value]) => [
        cleanText(key, 80),
        typeof value === "string"
          ? cleanText(value, 180)
          : typeof value === "number"
            ? value
            : Boolean(value)
      ])
    ),
    campaignCanon: {
      facts: cleanStringArray(canon.facts, 80, 400),
      events: cleanStringArray(canon.events, 80, 400),
      unresolvedThreads: cleanStringArray(canon.unresolvedThreads, 30, 280),
      resolvedThreads: cleanStringArray(canon.resolvedThreads, 40, 280),
      characters: cleanStringArray(canon.characters, 40, 240),
      locations: cleanStringArray(canon.locations, 40, 240)
    },
    inventory: (Array.isArray(state.inventory) ? state.inventory : [])
      .slice(-40)
      .map(normalizeItem),
    recentHistory: (Array.isArray(state.recentHistory) ? state.recentHistory : [])
      .slice(-16)
      .map((entry) => ({
        turn: Number(entry?.turn) || 0,
        action: cleanText(entry?.action, 600),
        summary: cleanText(entry?.summary, 400),
        location: cleanText(entry?.location, 180),
        stageId: cleanText(entry?.stageId, 60),
        backroomsFloor: clamp(entry?.backroomsFloor, -1, 15),
        sceneTitle: cleanText(entry?.sceneTitle, 200)
      }))
  };
}

export function normalizePlan(rawPlan, state) {
  if (!rawPlan || typeof rawPlan !== "object") {
    throw new Error("Model đạo diễn trả về dữ liệu không hợp lệ.");
  }

  const effects = {};
  for (const [key, [min, max]] of Object.entries(EFFECT_LIMITS)) {
    effects[key] = clamp(rawPlan.effects?.[key], min, max);
  }

  const campaignEffects = {};
  for (const [key, [min, max]] of Object.entries(CAMPAIGN_EFFECT_LIMITS)) {
    campaignEffects[key] = clamp(rawPlan.campaignEffects?.[key], min, max);
  }

  const currentObjectives = getCurrentObjectives(state.progression);
  const completedSet = new Set(state.progression.completedObjectiveIds);
  const allowedObjectiveIds = new Set(
    currentObjectives
      .filter((objective) => !completedSet.has(objective.id))
      .map((objective) => objective.id)
  );

  const completedObjectiveIds = cleanStringArray(
    rawPlan.progressionUpdate?.completedObjectiveIds,
    1,
    80
  ).filter((id) => allowedObjectiveIds.has(id));

  const updates = rawPlan.worldUpdates && typeof rawPlan.worldUpdates === "object"
    ? rawPlan.worldUpdates
    : {};

  const itemsFound = (Array.isArray(updates.itemsFound) ? updates.itemsFound : [])
    .map(normalizeItem)
    .filter((item) => item.id && item.name)
    .slice(0, 3);

  const dialoguePlan = (Array.isArray(rawPlan.dialoguePlan) ? rawPlan.dialoguePlan : [])
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      speaker: cleanText(entry.speaker, 80),
      intent: cleanText(entry.intent, 240),
      subtext: cleanText(entry.subtext, 240),
      allowedFacts: cleanStringArray(entry.allowedFacts, 3, 240)
    }))
    .filter((entry) => entry.speaker && entry.intent)
    .slice(0, 6);

  const choicePlans = (Array.isArray(rawPlan.choicePlans) ? rawPlan.choicePlans : [])
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      action: cleanText(entry.action, 220),
      tacticalPurpose: cleanText(entry.tacticalPurpose, 220),
      tradeoff: cleanText(entry.tradeoff, 220)
    }))
    .filter((entry) => entry.action && entry.tacticalPurpose)
    .slice(0, 3);

  if (choicePlans.length !== 3) {
    throw new Error("Model đạo diễn chưa tạo đủ ba hướng hành động.");
  }

  return {
    beats: cleanStringArray(rawPlan.beats, 5, 400),
    sensoryDetails: cleanStringArray(rawPlan.sensoryDetails, 5, 240),
    dialoguePlan,
    choicePlans,
    effects,
    campaignEffects,
    progressionUpdate: {
      completedObjectiveIds,
      backroomsMarksAdded: cleanStringArray(
        rawPlan.progressionUpdate?.backroomsMarksAdded,
        2,
        180
      ),
      partySeparated: Boolean(rawPlan.progressionUpdate?.partySeparated)
    },
    worldUpdates: {
      sceneTitle: cleanText(updates.sceneTitle, 200) || "Tình thế mới",
      sceneKicker: cleanText(updates.sceneKicker, 120) || "CHIẾN DỊCH",
      currentLocation: cleanText(updates.currentLocation, 180) || state.currentLocation,
      eventSummary: cleanText(updates.eventSummary, 400),
      newCanonFacts: cleanStringArray(updates.newCanonFacts, 6, 400),
      newThreads: cleanStringArray(updates.newThreads, 4, 280),
      resolvedThreads: cleanStringArray(updates.resolvedThreads, 4, 280),
      newCharacters: cleanStringArray(updates.newCharacters, 4, 240),
      newLocations: cleanStringArray(updates.newLocations, 4, 240),
      itemsFound
    },
    summary: cleanText(rawPlan.summary, 400) || "Tình thế chiến dịch đã thay đổi."
  };
}

export function normalizeProse(rawProse, plan) {
  if (!rawProse || typeof rawProse !== "object") {
    throw new Error("Model viết văn trả về dữ liệu không hợp lệ.");
  }

  const narration = cleanProse(rawProse.narration, 8000);
  const choices = cleanStringArray(rawProse.choices, 3, 260);
  if (!narration || choices.length !== 3) {
    throw new Error("Model viết văn chưa trả đủ lời kể và ba lựa chọn.");
  }

  const allowedSpeakers = new Set(
    plan.dialoguePlan.map((entry) => entry.speaker.toLocaleLowerCase("vi"))
  );

  const dialogue = (Array.isArray(rawProse.dialogue) ? rawProse.dialogue : [])
    .filter((line) => line && typeof line === "object")
    .map((line) => ({
      speaker: cleanText(line.speaker, 80),
      text: cleanText(line.text, 700)
    }))
    .filter((line) => {
      if (!line.speaker || !line.text || !allowedSpeakers.size) return false;
      return allowedSpeakers.has(line.speaker.toLocaleLowerCase("vi"));
    })
    .slice(0, 6);

  return { narration, dialogue, choices };
}

export function buildFinalResult(plan, prose) {
  return {
    narration: prose.narration,
    dialogue: prose.dialogue,
    choices: prose.choices,
    effects: plan.effects,
    campaignEffects: plan.campaignEffects,
    progressionUpdate: plan.progressionUpdate,
    worldUpdates: plan.worldUpdates,
    summary: plan.summary
  };
}

export function compactWriterState(state) {
  return {
    turn: state.turn,
    currentLocation: state.currentLocation,
    progression: state.progression,
    scene: {
      title: state.scene.title,
      narration: state.scene.narration.slice(-2),
      dialogue: state.scene.dialogue.slice(-4)
    },
    campaignStats: state.campaignStats,
    flags: state.flags,
    inventory: state.inventory.map((item) => ({
      id: item.id,
      name: item.name,
      effect: item.effect,
      limitations: item.limitations
    })),
    campaignFacts: state.campaignCanon.facts.slice(-16),
    unresolvedThreads: state.campaignCanon.unresolvedThreads.slice(-10),
    recentHistory: state.recentHistory.slice(-6)
  };
}
