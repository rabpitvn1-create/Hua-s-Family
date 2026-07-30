import { initGame } from "./game.js";
import { initAiGameMaster } from "./ai-game-master.js";

const bridge = initGame();
if (bridge) initAiGameMaster(bridge);
