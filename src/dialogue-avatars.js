import { HUA_SERVANT_AVATAR } from "./hua-servant-avatar.js";

function createObjectUrlFromDataUri(dataUri) {
  const value = String(dataUri || "");
  if (!value.startsWith("data:") || typeof URL === "undefined" || typeof Blob === "undefined") {
    return value;
  }

  try {
    const commaIndex = value.indexOf(",");
    if (commaIndex < 0) return value;

    const metadata = value.slice(5, commaIndex);
    const payload = value.slice(commaIndex + 1);
    const mimeType = metadata.split(";")[0] || "application/octet-stream";
    const binary = /;base64/i.test(metadata) ? atob(payload) : decodeURIComponent(payload);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
  } catch (error) {
    console.warn("Không thể chuyển avatar gia nhân sang Blob URL; dùng dữ liệu gốc.", error);
    return value;
  }
}

const huaServantAvatar = Object.freeze({
  src: createObjectUrlFromDataUri(HUA_SERVANT_AVATAR),
  alt: "Chân dung gia nhân Hứa Gia",
  type: "servant"
});

const avatarBySpeaker = Object.freeze({
  kai: { src: "assets/avatars/kai.svg", alt: "Chân dung Kai", type: "elysium" },
  phantom: { src: "assets/avatars/kai.svg", alt: "Chân dung Kai", type: "elysium" },
  "kai / phantom": { src: "assets/avatars/kai.svg", alt: "Chân dung Kai", type: "elysium" },
  koei: { src: "assets/avatars/koei.svg", alt: "Chân dung Koei", type: "elysium" },
  "tiểu lan": { src: "assets/avatars/tieu-lan.svg", alt: "Chân dung Hứa Tiểu Lan", type: "target" },
  "hứa tiểu lan": { src: "assets/avatars/tieu-lan.svg", alt: "Chân dung Hứa Tiểu Lan", type: "target" },
  amy: { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy", type: "elysium" },
  delta: { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy", type: "elysium" },
  "amy/delta": { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy", type: "elysium" },
  "amy / delta": { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy", type: "elysium" },
  "gia nhân": huaServantAvatar,
  "gia nhân hứa gia": huaServantAvatar,
  "gia nhân nhà họ hứa": huaServantAvatar,
  "người hầu": huaServantAvatar,
  "người hầu hứa gia": huaServantAvatar,
  "người ở": huaServantAvatar,
  "người ở hứa gia": huaServantAvatar,
  "người làm hứa gia": huaServantAvatar,
  "đầy tớ hứa gia": huaServantAvatar,
  "quản gia hứa gia": huaServantAvatar
});

const genericServantLabels = Object.freeze([
  "gia nhân",
  "người hầu",
  "người ở",
  "người làm",
  "đầy tớ",
  "a hoàn",
  "hầu gái",
  "quản gia",
  "phu bếp",
  "phu xe"
]);

function normalizeSpeaker(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("vi");
}

function isHuaServantSpeaker(normalizedName) {
  if (!normalizedName) return false;

  if (
    normalizedName.startsWith("gia nhân hứa gia")
    || normalizedName.startsWith("gia nhân nhà họ hứa")
    || normalizedName.startsWith("người hầu hứa gia")
    || normalizedName.startsWith("người ở hứa gia")
    || normalizedName.startsWith("người làm hứa gia")
    || normalizedName.startsWith("đầy tớ hứa gia")
    || normalizedName.startsWith("quản gia hứa gia")
  ) {
    return true;
  }

  const mentionsHuaFamily = normalizedName.includes("hứa gia")
    || normalizedName.includes("nhà họ hứa")
    || normalizedName.includes("phủ hứa")
    || normalizedName.includes("nhà hứa");
  const mentionsServantRole = genericServantLabels.some((label) => normalizedName.includes(label));

  if (mentionsHuaFamily && mentionsServantRole) return true;

  return genericServantLabels.some((label) =>
    normalizedName === label
    || normalizedName.startsWith(`${label} —`)
    || normalizedName.startsWith(`${label} -`)
    || normalizedName.startsWith(`${label}:`)
  );
}

function resolveAvatar(speakerName) {
  const normalizedName = normalizeSpeaker(speakerName);
  return avatarBySpeaker[normalizedName]
    || (isHuaServantSpeaker(normalizedName) ? huaServantAvatar : null);
}

function initialsFor(name) {
  const words = String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "?";
  return words.slice(0, 2).map((word) => word[0]?.toLocaleUpperCase("vi") || "").join("") || "?";
}

function createFallbackAvatar(speakerName) {
  const fallback = document.createElement("span");
  fallback.className = "dialogue-avatar dialogue-avatar-fallback";
  fallback.textContent = initialsFor(speakerName);
  fallback.setAttribute("role", "img");
  fallback.setAttribute("aria-label", `Avatar tạm của ${speakerName || "nhân vật"}`);
  return fallback;
}

function createAvatar(speakerName) {
  const avatar = resolveAvatar(speakerName);
  if (!avatar) return createFallbackAvatar(speakerName);

  const image = document.createElement("img");
  image.className = "dialogue-avatar";
  image.src = avatar.src;
  image.alt = avatar.alt;
  image.width = 96;
  image.height = 96;
  image.decoding = "async";
  image.loading = "eager";
  image.addEventListener("error", () => {
    image.replaceWith(createFallbackAvatar(speakerName));
  }, { once: true });
  return image;
}

export function decorateDialogueElement(element, explicitSpeaker = "") {
  if (!(element instanceof Element) || element.dataset.avatarChecked === "true") return element;

  const speakerNode = element.querySelector(".speaker, strong");
  const speakerName = String(explicitSpeaker || speakerNode?.textContent || "Nhân vật").trim();
  const avatar = resolveAvatar(speakerName);

  element.dataset.avatarChecked = "true";
  element.dataset.speakerType = avatar?.type || "unknown";
  element.classList.add("has-avatar");
  element.prepend(createAvatar(speakerName));
  return element;
}

function decorateRoot(root) {
  if (!(root instanceof Element)) return;
  root.querySelectorAll(".dialogue, .ai-dialogue-line").forEach((element) => {
    decorateDialogueElement(element);
  });
}

export function initDialogueAvatars() {
  const roots = [
    document.querySelector("#story-text"),
    document.querySelector("#ai-dialogue")
  ].filter(Boolean);

  roots.forEach((root) => {
    decorateRoot(root);
    const observer = new MutationObserver(() => decorateRoot(root));
    observer.observe(root, { childList: true, subtree: true });
  });
}
