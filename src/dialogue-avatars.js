(function () {
  "use strict";

  const amyAvatar = {
    src: "assets/avatars/amy.jpg",
    alt: "Chân dung Amy"
  };

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
    },
    Amy: amyAvatar,
    AMY: amyAvatar,
    Delta: amyAvatar,
    DELTA: amyAvatar,
    "Amy/Delta": amyAvatar,
    "Amy / Delta": amyAvatar,
    "AMY/DELTA": amyAvatar,
    "AMY / DELTA": amyAvatar
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

    .story-text .dialogue-avatar {
      position: absolute;
      z-index: 1;
      width: var(--avatar-size);
      height: var(--avatar-size);
      left: calc(-1 * (var(--avatar-size) - var(--avatar-overlap)));
      top: 50%;
      transform: translateY(-50%);
      object-fit: cover;
      object-position: 50% 36%;
      border: 1px solid var(--accent);
      border-radius: .4rem;
      background: #0b0d12;
      box-shadow:
        0 0 0 3px rgb(13 11 10 / 88%),
        0 12px 28px rgb(0 0 0 / 45%),
        0 0 24px rgb(70 118 210 / 18%);
      pointer-events: none;
    }

    .choice {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    .choice > *:not(.choice-ripple) {
      position: relative;
      z-index: 1;
    }

    .choice:active {
      transform: translateY(1px) scale(.985);
      border-color: var(--focus);
      background: #291f19;
    }

    .choice.is-selected {
      transform: scale(.985);
      border-color: var(--focus);
      background:
        linear-gradient(90deg, rgb(199 163 107 / 18%), transparent 72%),
        #211814;
      box-shadow:
        0 0 0 2px rgb(243 215 162 / 12%),
        inset 0 0 24px rgb(199 163 107 / 8%);
    }

    .choice.is-selected .choice-number {
      color: var(--focus);
      transform: scale(1.15);
    }

    .choice.is-disabled {
      opacity: .48;
      pointer-events: none;
    }

    .choice-ripple {
      position: absolute;
      z-index: 0;
      width: 1px;
      height: 1px;
      border-radius: 999px;
      background: rgb(243 215 162 / 34%);
      pointer-events: none;
      transform: translate(-50%, -50%) scale(0);
      animation: choice-ripple .42s ease-out forwards;
    }

    @keyframes choice-ripple {
      0% {
        opacity: .9;
        transform: translate(-50%, -50%) scale(0);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @media (max-width: 560px) {
      .story-text .dialogue.has-avatar {
        --avatar-size: 4.65rem;
        --avatar-overlap: .75rem;
        min-height: calc(var(--avatar-size) - .6rem);
        padding-left: calc(.8rem + var(--avatar-overlap));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .choice,
      .choice-number {
        transition: none !important;
      }

      .choice-ripple {
        display: none;
      }
    }
  `;
  document.head.append(styles);

  function decorateDialogue(dialogue) {
    if (dialogue.dataset.avatarChecked === "true") return;
    dialogue.dataset.avatarChecked = "true";

    const speaker = dialogue.querySelector(".speaker");
    const speakerName = speaker ? speaker.textContent.trim() : "";
    const avatar = characterAvatars[speakerName];

    if (!avatar) return;

    const image = document.createElement("img");
    image.className = "dialogue-avatar";
    image.src = avatar.src;
    image.alt = avatar.alt;
    image.width = 96;
    image.height = 96;
    image.decoding = "async";
    image.loading = "lazy";

    dialogue.classList.add("has-avatar");
    dialogue.prepend(image);
  }

  function decorateAll(root) {
    root.querySelectorAll(".dialogue").forEach(decorateDialogue);
  }

  function addChoiceRipple(button, event) {
    const rect = button.getBoundingClientRect();
    const useCenter = !event.clientX && !event.clientY;
    const x = useCenter ? rect.width / 2 : event.clientX - rect.left;
    const y = useCenter ? rect.height / 2 : event.clientY - rect.top;
    const size = Math.ceil(Math.hypot(rect.width, rect.height) * 2);

    const ripple = document.createElement("span");
    ripple.className = "choice-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    button.append(ripple);
  }

  let choiceFeedbackLocked = false;

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".choice");
    if (!button) return;

    if (button.dataset.choiceFeedbackPass === "true") {
      delete button.dataset.choiceFeedbackPass;
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (choiceFeedbackLocked) return;
    choiceFeedbackLocked = true;

    addChoiceRipple(button, event);
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");

    button.parentElement.querySelectorAll(".choice").forEach((item) => {
      if (item !== button) item.classList.add("is-disabled");
    });

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
    window.setTimeout(() => {
      button.dataset.choiceFeedbackPass = "true";
      button.click();
      window.setTimeout(() => {
        choiceFeedbackLocked = false;
      }, 0);
    }, delay);
  }, true);

  const story = document.querySelector("#story-text");
  if (!story) return;

  decorateAll(story);

  const observer = new MutationObserver(() => decorateAll(story));
  observer.observe(story, { childList: true, subtree: true });
}());
