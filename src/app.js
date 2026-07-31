import { initMissionInterface } from "./ui-shell.js";
import { initGame } from "./game.js";
import { initAiGameMaster } from "./ai-game-master.js";
import { initDialogueAvatars } from "./dialogue-avatars.js";

initMissionInterface();
initDialogueAvatars();
const bridge = initGame();
if (bridge) initAiGameMaster(bridge);
