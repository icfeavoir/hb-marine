import "./Game1.css";

import { useMemo, useCallback, useState, useEffect } from "react";

import { getRandomNumber } from "../../utils/number.utils";
import { StartEndGame } from "../StartEndGame";

import img from "../../assets/game-1/img-game1.jpg";

type Props = {
  onSuccess: () => void;
};

/**
 * Game 1
 * Clic on Marine's head
 */
export const Game1 = (props: Props) => {
  const [gameState, setGameState] = useState<"intro" | "game" | "win">("intro");
  const [isImageVisible, setImageVisible] = useState(false);
  const [failuresCount, setFailuresCount] = useState(0);

  const [style, setStyle] = useState<React.CSSProperties>({});

  const screenRatio = useMemo(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const screenRatio = screenWidth / screenHeight;
    return screenRatio;
  }, []);

  useEffect(() => {
    // image is not visible anymore, hide it but keep others CSS properties
    if (!isImageVisible) {
      return setStyle((curr) => ({
        ...curr,
        transform: "scale(0)",
      }));
    }

    const imgSizeHeight = getRandomNumber(8, 15);
    const imgSizeWidth = imgSizeHeight / screenRatio;

    const top = getRandomNumber(0, 100 - imgSizeHeight);
    const left = getRandomNumber(0, 100 - imgSizeWidth);

    setStyle({
      height: `${imgSizeHeight}vh`,
      width: `${imgSizeWidth}vw`,
      top: `${top}vh`,
      left: `${left}vw`,
      transform: "scale(1)",
    });
  }, [isImageVisible, screenRatio]);

  /**
   * Change img visibility
   */
  useEffect(() => {
    if (gameState === "intro") return;

    if (gameState === "win") {
      setImageVisible(true);
      return;
    }

    let timeout: number;
    // When image is visible, hide it quickly
    if (isImageVisible) {
      // make is easier with failures increment (every 5 failures)
      const failureHelper = 1 + Math.floor(failuresCount / 5) * 0.1;

      const time = getRandomNumber(350 * failureHelper, 600 * failureHelper);
      timeout = setTimeout(() => {
        setImageVisible(false);
      }, time);
      return;
    } else {
      const time = getRandomNumber(1300, 3000);
      // Else, hide it for a long time
      timeout = setTimeout(() => {
        setImageVisible(true);
      }, time);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [gameState, isImageVisible, failuresCount]);

  const addFailure = useCallback(() => {
    if (gameState !== "game") return;
    setFailuresCount((curr) => curr + 1);
  }, [gameState]);

  const onImageClick = useCallback(() => {
    setGameState("win");
  }, []);

  return (
    <div className="game-container" id="game-1-container" onClick={addFailure}>
      {/* INTRO */}
      {gameState === "intro" && (
        <StartEndGame
          title="Jeu 1"
          subtitle="Attrape Marine"
          btnText="Go !"
          onClick={() => setGameState("game")}
        />
      )}

      {/* GAME */}
      {gameState === "game" && (
        <img onClick={onImageClick} id="click-img" src={img} style={style} />
      )}

      {/* WIN SCREEN */}
      {gameState === "win" && (
        <StartEndGame
          title="Bravo !"
          subtitle={`Tu as réussi en ${failuresCount} tentatives ! Jeu suivant ?`}
          btnText="Yes !"
          onClick={props.onSuccess}
        />
      )}
    </div>
  );
};
