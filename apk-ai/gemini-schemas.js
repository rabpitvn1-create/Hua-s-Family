export const ITEM_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    type: { type: "string" },
    rarity: { type: "string" },
    description: { type: "string" },
    effect: { type: "string" },
    limitations: { type: "string" },
    imagePrompt: { type: "string" }
  },
  required: ["id", "name", "type", "rarity", "description", "effect", "limitations", "imagePrompt"]
};

const EFFECT_SCHEMA = {
  type: "object",
  properties: {
    alertDelta: { type: "integer", minimum: -8, maximum: 15 },
    ritualDelta: { type: "integer", minimum: -8, maximum: 12 },
    civilianSafetyDelta: { type: "integer", minimum: -12, maximum: 3 },
    evidenceDelta: { type: "integer", minimum: 0, maximum: 2 },
    timeDelta: { type: "integer", minimum: -15, maximum: 3 },
    controlDelta: { type: "integer", minimum: -12, maximum: 12 },
    signalRiskDelta: { type: "integer", minimum: -8, maximum: 15 }
  },
  required: [
    "alertDelta", "ritualDelta", "civilianSafetyDelta", "evidenceDelta",
    "timeDelta", "controlDelta", "signalRiskDelta"
  ]
};

const CAMPAIGN_EFFECT_SCHEMA = {
  type: "object",
  properties: {
    lanHealthDelta: { type: "integer", minimum: -12, maximum: 8 },
    lanTrustDelta: { type: "integer", minimum: -10, maximum: 12 },
    lanMaterInfluenceDelta: { type: "integer", minimum: -8, maximum: 12 },
    partyHealthDelta: { type: "integer", minimum: -15, maximum: 8 },
    suppliesDelta: { type: "integer", minimum: -3, maximum: 2 },
    ammunitionDelta: { type: "integer", minimum: -20, maximum: 10 },
    memoryIntegrityDelta: { type: "integer", minimum: -15, maximum: 5 },
    cluesHuaGiaDelta: { type: "integer", minimum: 0, maximum: 3 },
    civiliansSavedDelta: { type: "integer", minimum: 0, maximum: 5 },
    falseMemoryCountDelta: { type: "integer", minimum: -1, maximum: 2 }
  },
  required: [
    "lanHealthDelta", "lanTrustDelta", "lanMaterInfluenceDelta",
    "partyHealthDelta", "suppliesDelta", "ammunitionDelta",
    "memoryIntegrityDelta", "cluesHuaGiaDelta", "civiliansSavedDelta",
    "falseMemoryCountDelta"
  ]
};

const PROGRESSION_SCHEMA = {
  type: "object",
  properties: {
    completedObjectiveIds: {
      type: "array",
      maxItems: 1,
      items: { type: "string" }
    },
    backroomsMarksAdded: {
      type: "array",
      maxItems: 2,
      items: { type: "string" }
    },
    partySeparated: { type: "boolean" }
  },
  required: ["completedObjectiveIds", "backroomsMarksAdded", "partySeparated"]
};

const WORLD_UPDATE_SCHEMA = {
  type: "object",
  properties: {
    sceneTitle: { type: "string" },
    sceneKicker: { type: "string" },
    currentLocation: { type: "string" },
    eventSummary: { type: "string" },
    newCanonFacts: { type: "array", maxItems: 6, items: { type: "string" } },
    newThreads: { type: "array", maxItems: 4, items: { type: "string" } },
    resolvedThreads: { type: "array", maxItems: 4, items: { type: "string" } },
    newCharacters: { type: "array", maxItems: 4, items: { type: "string" } },
    newLocations: { type: "array", maxItems: 4, items: { type: "string" } },
    itemsFound: { type: "array", maxItems: 3, items: ITEM_SCHEMA }
  },
  required: [
    "sceneTitle", "sceneKicker", "currentLocation", "eventSummary",
    "newCanonFacts", "newThreads", "resolvedThreads", "newCharacters",
    "newLocations", "itemsFound"
  ]
};

export const DIRECTOR_SCHEMA = {
  type: "object",
  properties: {
    beats: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: { type: "string" }
    },
    sensoryDetails: {
      type: "array",
      minItems: 2,
      maxItems: 5,
      items: { type: "string" }
    },
    dialoguePlan: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          speaker: { type: "string" },
          intent: { type: "string" },
          subtext: { type: "string" },
          allowedFacts: {
            type: "array",
            maxItems: 3,
            items: { type: "string" }
          }
        },
        required: ["speaker", "intent", "subtext", "allowedFacts"]
      }
    },
    choicePlans: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          tacticalPurpose: { type: "string" },
          tradeoff: { type: "string" }
        },
        required: ["action", "tacticalPurpose", "tradeoff"]
      }
    },
    effects: EFFECT_SCHEMA,
    campaignEffects: CAMPAIGN_EFFECT_SCHEMA,
    progressionUpdate: PROGRESSION_SCHEMA,
    worldUpdates: WORLD_UPDATE_SCHEMA,
    summary: { type: "string" }
  },
  required: [
    "beats", "sensoryDetails", "dialoguePlan", "choicePlans", "effects",
    "campaignEffects", "progressionUpdate", "worldUpdates", "summary"
  ]
};

export const WRITER_SCHEMA = {
  type: "object",
  properties: {
    narration: { type: "string" },
    dialogue: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          speaker: { type: "string" },
          text: { type: "string" }
        },
        required: ["speaker", "text"]
      }
    },
    choices: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" }
    }
  },
  required: ["narration", "dialogue", "choices"]
};

export const EFFECT_LIMITS = {
  alertDelta: [-8, 15],
  ritualDelta: [-8, 12],
  civilianSafetyDelta: [-12, 3],
  evidenceDelta: [0, 2],
  timeDelta: [-15, 3],
  controlDelta: [-12, 12],
  signalRiskDelta: [-8, 15]
};

export const CAMPAIGN_EFFECT_LIMITS = {
  lanHealthDelta: [-12, 8],
  lanTrustDelta: [-10, 12],
  lanMaterInfluenceDelta: [-8, 12],
  partyHealthDelta: [-15, 8],
  suppliesDelta: [-3, 2],
  ammunitionDelta: [-20, 10],
  memoryIntegrityDelta: [-15, 5],
  cluesHuaGiaDelta: [0, 3],
  civiliansSavedDelta: [0, 5],
  falseMemoryCountDelta: [-1, 2]
};
