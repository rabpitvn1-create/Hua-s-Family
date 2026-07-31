const avatarBySpeaker = Object.freeze({
  kai: { src: "assets/avatars/kai.svg", alt: "Chân dung Kai" },
  phantom: { src: "assets/avatars/kai.svg", alt: "Chân dung Kai" },
  "kai / phantom": { src: "assets/avatars/kai.svg", alt: "Chân dung Kai" },
  koei: { src: "assets/avatars/koei.svg", alt: "Chân dung Koei" },
  "tiểu lan": { src: "assets/avatars/tieu-lan.svg", alt: "Chân dung Hứa Tiểu Lan" },
  "hứa tiểu lan": { src: "assets/avatars/tieu-lan.svg", alt: "Chân dung Hứa Tiểu Lan" },
  amy: { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy" },
  delta: { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy" },
  "amy/delta": { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy" },
  "amy / delta": { src: "assets/avatars/amy.jpg", alt: "Chân dung Amy" }
});

function normalizeSpeaker(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("vi");
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
  const avatar = avatarBySpeaker[normalizeSpeaker(speakerName)];
  if (!avatar) return createFallbackAvatar(speakerName);

  const image = document.createElement("img");
  image.className = "dialogue-avatar";
  image.src = avatar.src;
  image.alt = avatar.alt;
  image.width = 96;
  image.height = 96;
  image.decoding = "async";
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.replaceWith(createFallbackAvatar(speakerName));
  }, { once: true });
  return image;
}

export function decorateDialogueElement(element, explicitSpeaker = "") {
  if (!(element instanceof Element) || element.dataset.avatarChecked === "true") return element;

  const speakerNode = element.querySelector(".speaker, strong");
  const speakerName = String(explicitSpeaker || speakerNode?.textContent || "Nhân vật").trim();
  element.dataset.avatarChecked = "true";
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

function installStyles() {
  if (document.querySelector("style[data-dialogue-avatars='sandbox-v1']")) return;
  const styles = document.createElement("style");
  styles.dataset.dialogueAvatars = "sandbox-v1";
  styles.textContent = `
    .story-text .dialogue.has-avatar,
    .ai-dialogue-line.has-avatar {
      display: grid;
      grid-template-columns: 4.9rem minmax(0, 1fr);
      grid-template-rows: auto auto;
      column-gap: .85rem;
      row-gap: .28rem;
      align-items: start;
    }

    .story-text .dialogue.has-avatar > .dialogue-avatar,
    .ai-dialogue-line.has-avatar > .dialogue-avatar {
      grid-column: 1;
      grid-row: 1 / 3;
      width: 4.9rem;
      height: 4.9rem;
      object-fit: cover;
      object-position: 50% 34%;
      border: 1px solid var(--accent);
      border-radius: .42rem;
      background: #0b0d12;
      box-shadow: 0 0 0 3px rgb(13 11 10 / 88%), 0 10px 24px rgb(0 0 0 / 42%);
    }

    .dialogue-avatar-fallback {
      display: grid;
      place-items: center;
      color: var(--focus);
      background:
        radial-gradient(circle at 30% 22%, rgb(243 215 162 / 22%), transparent 40%),
        linear-gradient(145deg, #2a201a, #111015) !important;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: .06em;
    }

    .story-text .dialogue.has-avatar > .speaker,
    .ai-dialogue-line.has-avatar > strong {
      grid-column: 2;
      grid-row: 1;
    }

    .story-text .dialogue.has-avatar > .speaker + span,
    .ai-dialogue-line.has-avatar > strong + span {
      grid-column: 2;
      grid-row: 2;
      min-width: 0;
    }

    @media (max-width: 560px) {
      .story-text .dialogue.has-avatar,
      .ai-dialogue-line.has-avatar {
        grid-template-columns: 4rem minmax(0, 1fr);
        column-gap: .7rem;
      }

      .story-text .dialogue.has-avatar > .dialogue-avatar,
      .ai-dialogue-line.has-avatar > .dialogue-avatar {
        width: 4rem;
        height: 4rem;
      }
    }
  `;
  document.head.append(styles);
}

export function initDialogueAvatars() {
  installStyles();
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
