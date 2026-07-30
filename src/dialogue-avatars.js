(function () {
  "use strict";

  const characterAvatars = {
    Kai: {
      src: "assets/avatars/kai.svg",
      alt: "Chân dung Kai"
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

    @media (max-width: 560px) {
      .story-text .dialogue.has-avatar {
        --avatar-size: 4.65rem;
        --avatar-overlap: .75rem;
        min-height: calc(var(--avatar-size) - .6rem);
        padding-left: calc(.8rem + var(--avatar-overlap));
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

    dialogue.classList.add("has-avatar");
    dialogue.prepend(image);
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
