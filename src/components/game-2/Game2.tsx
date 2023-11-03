import "./Game2.css";

import { useMemo, useCallback, useState, useEffect } from "react";

import { getRandomNumber } from "../../utils/number.utils";
import { StartEndGame } from "../StartEndGame";

import marine0 from "../../assets/game-2/0.jpg";
import marine1 from "../../assets/game-2/1.jpg";
import marine2 from "../../assets/game-2/2.jpg";
import marine3 from "../../assets/game-2/3.jpg";
import marine4 from "../../assets/game-2/4.jpg";
import marine5 from "../../assets/game-2/5.jpg";

type Props = {
  onSuccess: () => void;
};

const SUITE_SIZE = 14;

const IMAGES = [marine0, marine1, marine2, marine3, marine4, marine5];

const DEFAULT_DURATION = 1200;

const insertItemAtOddIndices = (
  originalList: number[],
  itemToInsert: number,
) => {
  const modifiedList = [];

  for (let i = 0; i < originalList.length; i++) {
    modifiedList.push(originalList[i]);
    if (i < originalList.length - 1) {
      modifiedList.push(itemToInsert);
    }
  }
  return modifiedList;
};

// Create an asynchronous generator function that yields values after a delay
async function* getAsyncNumbers(
  list: number[],
  size: number,
  time: number,
): AsyncGenerator<number, void, unknown> {
  // a item followed by -1 (to hide in case same number following)
  const cutList = list.slice(0, size);
  const numbers = insertItemAtOddIndices(cutList, -1);
  for (let i = 0; i < numbers.length; i++) {
    const imageIndex = numbers[i];
    // if previous number was -1, less time before sending new number (-1 only for transition)
    const duration = i - 1 >= 0 && numbers[i - 1] === -1 ? time * 0.25 : time;
    yield await new Promise((resolve) =>
      setTimeout(() => resolve(imageIndex), duration),
    );
  }
}

/**
 * Game 2
 * Memorize buttons
 */
export const Game2 = (props: Props) => {
  const [gameState, setGameState] = useState<"intro" | "game" | "win">("intro");
  const [suite, setSuite] = useState<number[]>([]);
  const [playerSuite, setPlayerSuite] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [turn, setTurn] = useState<"computer" | "player">("computer");
  // timeout to cancel when clicking fast
  const [clickTimeout, setClickTimeout] = useState<number>();

  const [playerErrors, setPlayerErrors] = useState(0);

  // status at each turn
  const [userTurnStatus, setUserTurnStatus] = useState<
    "waiting" | "success" | "failure"
  >("waiting");

  const [selectedImage, setSelectedImage] = useState<number>();

  const imgLightDuration = useMemo(() => {
    if (level < 3) return DEFAULT_DURATION;
    // harder
    if (level < 7) return DEFAULT_DURATION * 0.75;
    // even harder
    if (level < 10) return DEFAULT_DURATION * 0.55;
    // even harder
    return DEFAULT_DURATION * 0.35;
  }, [level]);

  const initSuite = () => {
    let isSuiteValid = false;
    let filledSuite: number[] = [];

    // all possible numbers
    const possibleNumbers = Array.from(
      { length: IMAGES.length },
      (_, index) => index,
    );

    while (!isSuiteValid) {
      filledSuite = Array.from({ length: SUITE_SIZE }, () =>
        getRandomNumber(0, IMAGES.length - 1),
      );

      // just make sure all numbers are in list at list once
      isSuiteValid = possibleNumbers.every((num) => filledSuite.includes(num));
    }

    setSuite(filledSuite);
  };

  const startGame = useCallback(() => {
    setGameState("game");
  }, []);

  const getImageStyle = useCallback(
    (imageIndex: number): React.CSSProperties => {
      const isSelectedImage = selectedImage === imageIndex;
      return {
        // black and white if not selected
        filter: isSelectedImage ? undefined : "grayscale(1)",
        border: `5px solid ${isSelectedImage ? "#880808" : "black"}`,
      };
    },
    [selectedImage],
  );

  /**
   * Player clicked a btn
   */
  const addToPlayerSuite = useCallback(
    (num: number) => {
      if (turn === "computer") return;

      setSelectedImage(num);

      if (clickTimeout) clearTimeout(clickTimeout);

      // turn off quickly
      const timeout = setTimeout(() => {
        setSelectedImage(undefined);
      }, 500);

      setClickTimeout(timeout);
      setPlayerSuite((curr) => [...curr, num]);
    },
    [turn, clickTimeout],
  );

  /**
   * Each time players played, check the result
   */
  useEffect(() => {
    if (turn === "computer") return;

    const expectedSuite = suite.slice(0, level);
    const hasError = playerSuite.some(
      (playerNumber, index) => playerNumber !== expectedSuite[index],
    );

    // reinit if error
    if (hasError) {
      setPlayerSuite([]);
      setPlayerErrors((curr) => curr + 1);
      setUserTurnStatus("failure");
      // show error style, then go back to computer's turn
      setTimeout(() => {
        setUserTurnStatus("waiting");
        setTurn("computer");
      }, imgLightDuration);

      return;
    }

    // if player's turn is validated
    if (playerSuite.length === level) {
      setUserTurnStatus("success");
      setPlayerSuite([]);

      // it was last level
      if (level === SUITE_SIZE) {
        setGameState("win");
      }

      setTimeout(() => {
        // go to next level
        setLevel((curr) => curr + 1);
        setTurn("computer");
        setUserTurnStatus("waiting");
      }, imgLightDuration);
    }
  }, [playerSuite, level, turn, suite, imgLightDuration]);

  /**
   * Computer's turn
   */
  const playAsComputer = useCallback(async () => {
    if (suite.length === 0) throw new Error("game not ready");

    const asyncNumbers = getAsyncNumbers(suite, level, imgLightDuration);

    // Use the for await...of loop to iterate over the async generator
    for await (const item of asyncNumbers) {
      setSelectedImage(item);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        setSelectedImage(undefined);
        resolve(true);
      }, imgLightDuration);
    });
  }, [suite, level, imgLightDuration]);

  /**
   * When it is computer's turn
   */
  useEffect(() => {
    if (turn === "player") return;

    playAsComputer()
      .then(() => {
        setTurn("player");
      })
      .catch(() => {
        // nothing to do, game not ready
      });
  }, [turn, playAsComputer]);

  /**
   * Entry point, init list
   */
  useEffect(() => {
    if (gameState === "game") initSuite();
  }, [gameState]);

  const gameText = useMemo(() => {
    if (userTurnStatus === "failure") return "ERREUR !!!";
    if (userTurnStatus === "success") return "BRAVO !!!";

    return turn === "computer" ? "Regarde bien" : "À toi !";
  }, [userTurnStatus, turn]);

  return (
    <div
      className="game-container"
      id="game-2-container"
      style={{
        display: gameState === "game" ? "flex" : undefined,
      }}
    >
      {/* INTRO */}
      {gameState === "intro" && (
        <StartEndGame
          title="Jeu 2"
          subtitle="Mémorise ton Chemin"
          btnText="C'est parti !"
          onClick={startGame}
        />
      )}

      {/* GAME */}
      {gameState === "game" && (
        <>
          <h2 className="title">
            Level {level} / {SUITE_SIZE}
          </h2>
          <h3 className="title">{gameText}</h3>
          <div id="images-container">
            {IMAGES.map((img, index) => (
              <div key={index} className="image-item">
                <img
                  src={img}
                  style={getImageStyle(index)}
                  onClick={() => addToPlayerSuite(index)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* WIN SCREEN */}
      {gameState === "win" && (
        <StartEndGame
          title="Bravo !"
          subtitle={`${
            playerErrors === 0
              ? "Aucune erreur !"
              : `Seulement ${playerErrors} erreur${playerErrors > 1 ? "s" : ""}`
          } Jeu suivant ?`}
          btnText="Gooo"
          onClick={props.onSuccess}
        />
      )}
    </div>
  );
};
