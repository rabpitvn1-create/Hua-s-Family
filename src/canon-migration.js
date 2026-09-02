const LEGACY_FLAG_KEYS = Object.freeze(new Set([
  "phantomRingAvailable",
  "unlimitedGunWorksAvailable",
  "elysiumContactAvailable",
  "amyDeployed",
  "koeiDeployed"
]));

const LEGACY_CANON_PATTERNS = Object.freeze([
  /\bPhantom\b/i,
  /\bElysium\b/i,
  /MAGNUM\s+GHOST/i,
  /Unlimited\s+Gun\s+Works/i,
  /Ten\s+Absolute\s+Pistol\s+Arts/i,
  /PHANTOM(?:'|’)?S\s+RING/i,
  /Boundless\s+Mind(?:'|’)?s\s+Eye/i,
  /Ontological\s+Judgment/i,
  /\bAmy\b/i,
  /\bDelta\b/i,
  /\bKoei\b/i,
  /White\s+Wraith\s+Magnum/i,
  /Blackblood\s+Armor/i,
  /\bBlack\s+Blood\b/i,
  /\bHuyết\s+Nha\b/i,
  /\bEYE∞\b/i,
  /Command\s+Slate/i,
  /drone\s+mesh/i,
  /infinite\s+drones?/i
]);

export function containsLegacyCanonText(value) {
  const text = String(value ?? "");
  return LEGACY_CANON_PATTERNS.some((pattern) => pattern.test(text));
}

export function stripLegacyFlags(rawFlags) {
  const flags = rawFlags && typeof rawFlags === "object" ? rawFlags : {};
  return Object.fromEntries(
    Object.entries(flags).filter(([key]) => !LEGACY_FLAG_KEYS.has(key))
  );
}

export function sanitizeCanonTextArray(values, limit = 80) {
  return (Array.isArray(values) ? values : [])
    .filter((value) => typeof value === "string" && !containsLegacyCanonText(value))
    .slice(-limit);
}

function sanitizeDialogue(lines) {
  return (Array.isArray(lines) ? lines : [])
    .filter((line) => line && typeof line === "object")
    .filter((line) => !containsLegacyCanonText(line.speaker) && !containsLegacyCanonText(line.text));
}

function sanitizeHistory(entries) {
  return (Array.isArray(entries) ? entries : [])
    .filter((entry) => entry && typeof entry === "object")
    .filter((entry) => !containsLegacyCanonText(entry.summary) && !containsLegacyCanonText(entry.sceneTitle));
}

export function sanitizeLegacyCanonState(rawState) {
  if (!rawState || typeof rawState !== "object") return rawState;

  const scene = rawState.scene && typeof rawState.scene === "object" ? rawState.scene : {};
  const canon = rawState.campaignCanon && typeof rawState.campaignCanon === "object"
    ? rawState.campaignCanon
    : {};

  return {
    ...rawState,
    flags: stripLegacyFlags(rawState.flags),
    scene: {
      ...scene,
      narration: sanitizeCanonTextArray(scene.narration, 12),
      dialogue: sanitizeDialogue(scene.dialogue),
      choices: sanitizeCanonTextArray(scene.choices, 3)
    },
    campaignCanon: {
      ...canon,
      facts: sanitizeCanonTextArray(canon.facts, 100),
      events: sanitizeCanonTextArray(canon.events, 100),
      unresolvedThreads: sanitizeCanonTextArray(canon.unresolvedThreads, 36),
      resolvedThreads: sanitizeCanonTextArray(canon.resolvedThreads, 50),
      characters: sanitizeCanonTextArray(canon.characters, 50),
      locations: sanitizeCanonTextArray(canon.locations, 50)
    },
    history: sanitizeHistory(rawState.history),
    recentHistory: sanitizeHistory(rawState.recentHistory)
  };
}

export const LEGACY_CANON_GUARD = Object.freeze({
  flagKeys: [...LEGACY_FLAG_KEYS],
  patterns: LEGACY_CANON_PATTERNS.map((pattern) => pattern.source)
});
