const DEFAULT_CHARACTER = Object.freeze({
  id: "kai",
  name: "Kai",
  alias: "Phantom",
  role: "ĐẶC VỤ HIỆN TRƯỜNG",
  summary: "Sát thủ Elysium · quyền tự chủ tác chiến",
  image: "assets/avatars/kai.svg",
  alt: "Chân dung Kai, bí danh Phantom"
});

function cleanText(value, fallback, maxLength = 160) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return (text || fallback).slice(0, maxLength);
}

function safePortrait(value) {
  const source = String(value ?? "").trim();
  return /^assets\/avatars\/[A-Za-z0-9._/-]+\.(?:svg|png|webp|jpe?g)$/i.test(source)
    ? source
    : DEFAULT_CHARACTER.image;
}

function normalizeCharacter(raw = {}) {
  return {
    id: cleanText(raw.id, DEFAULT_CHARACTER.id, 80),
    name: cleanText(raw.name, DEFAULT_CHARACTER.name, 80),
    alias: cleanText(raw.alias, "", 80),
    role: cleanText(raw.role, "NHÂN VẬT HIỆN TRƯỜNG", 100),
    summary: cleanText(raw.summary, "Chưa có ghi chú hiện trường.", 220),
    image: safePortrait(raw.image),
    alt: cleanText(raw.alt, `Chân dung ${cleanText(raw.name, DEFAULT_CHARACTER.name, 80)}`, 140)
  };
}

function buildOverlay() {
  const root = document.createElement("div");
  root.id = "character-overlay";
  root.className = "character-overlay";
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <button class="character-overlay-scrim" type="button" aria-label="Đóng hồ sơ nhân vật"></button>
    <section class="character-overlay-card" role="dialog" aria-modal="true" aria-labelledby="character-overlay-name" tabindex="-1">
      <button class="character-overlay-close" type="button" aria-label="Đóng hồ sơ nhân vật">×</button>
      <div class="character-overlay-portrait">
        <img id="character-overlay-image" src="${DEFAULT_CHARACTER.image}" alt="${DEFAULT_CHARACTER.alt}">
        <span aria-hidden="true" class="character-overlay-scan"></span>
      </div>
      <div class="character-overlay-copy">
        <p id="character-overlay-role" class="micro-label">${DEFAULT_CHARACTER.role}</p>
        <h2 id="character-overlay-name">${DEFAULT_CHARACTER.name} <span id="character-overlay-alias">/ ${DEFAULT_CHARACTER.alias}</span></h2>
        <p id="character-overlay-summary">${DEFAULT_CHARACTER.summary}</p>
        <span id="character-overlay-code" class="character-overlay-code">SNAPSHOT // KAI</span>
      </div>
    </section>
  `;
  document.body.append(root);
  return root;
}

export function initCharacterSnapshot() {
  const snapshot = document.querySelector(".field-rail .operator-card");
  if (!(snapshot instanceof HTMLElement)) return null;

  snapshot.classList.add("character-snapshot");
  snapshot.dataset.characterId = DEFAULT_CHARACTER.id;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "snapshot-hit-target";
  trigger.setAttribute("aria-label", "Mở snapshot nhân vật Kai");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-controls", "character-overlay");
  trigger.setAttribute("aria-expanded", "false");
  snapshot.append(trigger);

  const overlay = buildOverlay();
  const card = overlay.querySelector(".character-overlay-card");
  const scrim = overlay.querySelector(".character-overlay-scrim");
  const closeButton = overlay.querySelector(".character-overlay-close");
  const image = overlay.querySelector("#character-overlay-image");
  const role = overlay.querySelector("#character-overlay-role");
  const name = overlay.querySelector("#character-overlay-name");
  const alias = overlay.querySelector("#character-overlay-alias");
  const summary = overlay.querySelector("#character-overlay-summary");
  const code = overlay.querySelector("#character-overlay-code");
  let restoreFocus = null;

  function render(rawCharacter) {
    const character = normalizeCharacter(rawCharacter);
    if (image instanceof HTMLImageElement) {
      image.src = character.image;
      image.alt = character.alt;
    }
    if (role) role.textContent = character.role;
    if (name) name.childNodes[0].nodeValue = `${character.name} `;
    if (alias) {
      alias.textContent = character.alias ? `/ ${character.alias}` : "";
      alias.hidden = !character.alias;
    }
    if (summary) summary.textContent = character.summary;
    if (code) code.textContent = `SNAPSHOT // ${character.id.toUpperCase()}`;
    return character;
  }

  function show(rawCharacter = DEFAULT_CHARACTER) {
    const character = render(rawCharacter);
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("character-overlay-open");
    trigger.setAttribute("aria-expanded", "true");
    window.setTimeout(() => card?.focus(), 20);
    return character;
  }

  function hide() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("character-overlay-open");
    trigger.setAttribute("aria-expanded", "false");
    restoreFocus?.focus({ preventScroll: true });
  }

  trigger.addEventListener("click", () => show(DEFAULT_CHARACTER));
  scrim?.addEventListener("click", hide);
  closeButton?.addEventListener("click", hide);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      event.preventDefault();
      hide();
    }
  });

  window.addEventListener("hua:character-overlay", (event) => {
    const detail = event.detail;
    if (detail?.open === false) hide();
    else show(detail || DEFAULT_CHARACTER);
  });

  return Object.freeze({ show, hide });
}
