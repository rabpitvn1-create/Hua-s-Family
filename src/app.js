import { initGame } from "./game.js";
import { initAiGameMaster } from "./ai-game-master.js";
import { initDialogueAvatars } from "./dialogue-avatars.js";

const bridge = initGame();
initDialogueAvatars();
if (bridge) initAiGameMaster(bridge);
