(function () {
  "use strict";

  const characterAvatars = {
    Kai: {
      src: "assets/avatars/kai.svg",
      alt: "Chân dung Kai"
    },
    Koei: {
      src: "assets/avatars/koei.svg",
      alt: "Chân dung Koei"
    },
    "Tiểu Lan": {
      src: "assets/avatars/tieu-lan.svg",
      alt: "Chân dung Hứa Tiểu Lan"
    }
  };

  const styles = document.createElement("style");
  styles.dataset.dialogueAvatars = "true";
  styles.textContent = `
    .story-text .dialogue.has-avatar {
      --avatar-size: 5.8rem;
      --avatar-overlap: 1rem;
      position: relative;
      min-height: calc(var(--avatar-size) - .8rem);
      margin-left: calc(var(--avatar-size) - var(--avatar-overlap));
      padding-left: calc(1rem + var(--avatar-overlap));
      overflow: visible;
    }

    .story-text .dialogue-avatar-button {
      position: absolute;
      z-index: 1;
      width: var(--avatar-size);
      height: var(--avatar-size);
      left: calc(-1 * (var(--avatar-size) - var(--avatar-overlap)));
      top: 50%;
      transform: translateY(-50%);
      padding: 0;
      border: 1px solid var(--accent);
      border-radius: .4rem;
      background: #0b0d12;
      box-shadow:
        0 0 0 3px rgb(13 11 10 / 88%),
        0 12px 28px rgb(0 0 0 / 45%),
        0 0 24px rgb(70 118 210 / 18%);
      cursor: zoom-in;
      overflow: hidden;
      transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
    }

    .story-text .dialogue-avatar-button:hover {
      transform: translateY(-50%) scale(1.035);
      border-color: var(--focus);
    }

    .story-text .dialogue-avatar-button:focus-visible {
      outline: 2px solid var(--focus);
      outline-offset: 4px;
    }

    .story-text .dialogue-avatar {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: 50% 36%;
      pointer-events: none;
    }

    .avatar-lightbox[hidden] {
      display: none;
    }

    .avatar-lightbox {
      position: fixed;
      z-index: 1000;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: rgb(0 0 0 / 82%);
      backdrop-filter: blur(8px);
    }

    .avatar-lightbox-card {
      position: relative;
      width: min(88vw, 36rem);
      margin: 0;
      padding: .75rem;
      border: 1px solid var(--accent);
      border-radius: .65rem;
      background: #0b0d12;
      box-shadow: 0 24px 80px rgb(0 0 0 / 70%);
    }

    .avatar-lightbox-image {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      object-position: 50% 36%;
      border-radius: .35rem;
    }

    .avatar-lightbox-caption {
      padding: .7rem .25rem .15rem;
      color: var(--accent);
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: .78rem;
      letter-spacing: .08em;
      text-align: center;
      text-transform: uppercase;
    }

    .avatar-lightbox-close {
      position: absolute;
      z-index: 1;
      top: .35rem;
      right: .35rem;
      width: 2.5rem;
      height: 2.5rem;
      padding: 0;
      border: 1px solid rgb(255 255 255 / 35%);
      border-radius: 999px;
      color: white;
      background: rgb(0 0 0 / 72%);
      font-size: 1.45rem;
      line-height: 1;
      cursor: pointer;
    }

    .avatar-lightbox-close:focus-visible {
      outline: 2px solid var(--focus);
      outline-offset: 3px;
    }

    html.avatar-lightbox-open,
    html.avatar-lightbox-open body {
      overflow: hidden;
    }

    @media (max-width: 560px) {
      .story-text .dialogue.has-avatar {
        --avatar-size: 4.65rem;
        --avatar-overlap: .75rem;
        min-height: calc(var(--avatar-size) - .6rem);
        padding-left: calc(.8rem + var(--avatar-overlap));
      }

      .avatar-lightbox-card {
        width: min(94vw, 32rem);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .story-text .dialogue-avatar-button {
        transition: none;
      }
    }
  `;
  document.head.append(styles);

  const lightbox = document.createElement("div");
  lightbox.className = "avatar-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Ảnh nhân vật");
  lightbox.innerHTML = `
    <figure class="avatar-lightbox-card">
      <button class="avatar-lightbox-close" type="button" aria-label="Đóng ảnh">×</button>
      <img class="avatar-lightbox-image" alt="">
      <figcaption class="avatar-lightbox-caption"></figcaption>
    </figure>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector(".avatar-lightbox-image");
  const lightboxCaption = lightbox.querySelector(".avatar-lightbox-caption");
  const lightboxClose = lightbox.querySelector(".avatar-lightbox-close");
  let lastTrigger = null;

  function openLightbox(avatar, speakerName, trigger) {
    lastTrigger = trigger;
    lightboxImage.src = avatar.src;
    lightboxImage.alt = avatar.alt;
    lightboxCaption.textContent = speakerName;
    lightbox.hidden = false;
    document.documentElement.classList.add("avatar-lightbox-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    document.documentElement.classList.remove("avatar-lightbox-open");
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus();
    lastTrigger = null;
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });

  function decorateDialogue(dialogue) {
    if (dialogue.dataset.avatarChecked === "true") return;
    dialogue.dataset.avatarChecked = "true";

    const speaker = dialogue.querySelector(".speaker");
    const speakerName = speaker ? speaker.textContent.trim() : "";
    const avatar = characterAvatars[speakerName];

    if (!avatar) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dialogue-avatar-button";
    button.setAttribute("aria-label", `Mở ảnh ${speakerName}`);
    button.title = `Chạm để xem ảnh ${speakerName}`;

    const image = document.createElement("img");
    image.className = "dialogue-avatar";
    image.src = avatar.src;
    image.alt = "";
    image.width = 96;
    image.height = 96;
    image.decoding = "async";
    image.loading = "lazy";

    button.append(image);
    button.addEventListener("click", () => openLightbox(avatar, speakerName, button));

    dialogue.classList.add("has-avatar");
    dialogue.prepend(button);
  }

  function decorateAll(root) {
    root.querySelectorAll(".dialogue").forEach(decorateDialogue);
  }

  const story = document.querySelector("#story-text");
  if (!story) return;

  decorateAll(story);

  const observer = new MutationObserver(() => decorateAll(story));
  observer.observe(story, { childList: true, subtree: true });
}());
