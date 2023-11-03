import "./Game.css";

import { useCallback, useState } from "react";

import { Game1 } from "./components/game-1/Game1";
import { Game2 } from "./components/game-2/Game2";
import { Game3 } from "./components/game-3/Game3";
import { WinnerPresent } from "./components/winner-present/WinnerPresent";

export const Game = () => {
  const [level, setLevel] = useState<1 | 2 | 3 | "win">(1);

  const CurrentGame = useCallback(() => {
    switch (level) {
      case 1:
        return <Game1 onSuccess={() => setLevel(2)} />;
      case 2:
        return <Game2 onSuccess={() => setLevel(3)} />;
      case 3:
        return <Game3 onSuccess={() => setLevel("win")} />;
      case "win":
        return <WinnerPresent />;
      default:
        break;
    }
  }, [level]);

  return <CurrentGame />;
};
