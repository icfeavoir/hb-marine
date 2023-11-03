import "./Game3.css";

import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import { StartEndGame } from "../StartEndGame";
import { Person } from "./Person";

import imgJuliette from "../../assets/game-3/juliette.jpg";
import imgDorine from "../../assets/game-3/dorine.jpg";
import imgBaloo from "../../assets/game-3/baloo.jpg";
import imgCecilia from "../../assets/game-3/cecilia.jpg";
import imgElsa from "../../assets/game-3/elsa.jpg";
import imgAx from "../../assets/game-3/ax.jpg";
import imgPierre from "../../assets/game-3/pierre.jpg";

type Props = {
  onSuccess: () => void;
};

const RIDDLE_TEXT = [
  "Pierre & Ax sont à côté",
  "Dorine n'est pas au bout",
  "Les garçons sont séparés par 3 filles",
  "Les célibataires sont dans l'ordre alphabétique",
  'Tous les prénoms contenant des "a" sont à côté',
  "Juliette est plus à gauche que Cecilia",
  "Elsa et Baloo ne sont pas à côté",
];

const SOLUTION_PERSONS = [
  "Juliette",
  "Dorine",
  "Baloo",
  "Cecilia",
  "Elsa",
  "Ax",
  "Pierre",
];

const PERSONS_IMAGES = new Map([
  ["Juliette", imgJuliette],
  ["Dorine", imgDorine],
  ["Baloo", imgBaloo],
  ["Cecilia", imgCecilia],
  ["Elsa", imgElsa],
  ["Ax", imgAx],
  ["Pierre", imgPierre],
]);

/**
 * Init with a random order
 */
const initPersons = (): string[] => {
  let proposition: string[] = [];
  let diffCount = 0;
  // we want at least 3 people not at the right place
  while (diffCount < 4) {
    proposition = [...SOLUTION_PERSONS].sort(() => 0.5 - Math.random());
    // check if the proposition is different from the solution
    diffCount = SOLUTION_PERSONS.reduce((acc, person, index) => {
      // increment diff count if this person is not at the right place
      if (proposition[index] !== person) return acc + 1;
      return acc;
    }, 0);
  }
  return proposition;
};

/**
 * Game 3
 * Riddle
 */
export const Game3 = (props: Props) => {
  const [gameState, setGameState] = useState<"intro" | "game" | "win">("intro");

  const [persons, setPersons] = useState<string[]>([]);

  /**
   * Entry point
   */
  useEffect(() => {
    const init = initPersons();
    setPersons(init);
  }, []);

  /**
   * When dropped
   */
  const movePerson = (fromIndex: number, toIndex: number) => {
    setPersons((curr) => {
      const newArr = [...curr];
      const [movedParagraph] = newArr.splice(fromIndex, 1);
      newArr.splice(toIndex, 0, movedParagraph);

      return newArr;
    });
  };

  /**
   * Check the results when order changes
   */
  useEffect(() => {
    if (gameState === "intro") return;

    const isOrderValid = SOLUTION_PERSONS.every(
      (person, index) => persons[index] === person,
    );

    // set back to game if already won
    if (!isOrderValid) return setGameState("game");

    // wait after drop to annouce the win
    setTimeout(() => {
      setGameState("win");
    }, 800);
  }, [gameState, persons]);

  return (
    <div className="game-container" id="game-3-container">
      {/* INTRO */}
      {gameState === "intro" && (
        <StartEndGame
          title="Jeu 3"
          subtitle="Tes méninges vont mariner"
          btnText="Je suis prête"
          onClick={() => setGameState("game")}
        />
      )}

      {/* GAME */}
      {gameState === "game" && (
        <div id="riddle-container">
          <h3>Remets tes ami·e·s dans le bon ordre sachant que :</h3>
          <br />
          {RIDDLE_TEXT.map((text, index) => (
            <p key={`riddle-${index}`}>
              {index + 1}. {text}
            </p>
          ))}
        </div>
      )}

      {/* WIN SCREEN (KEEP GAME VISIBLE) */}
      {gameState === "win" && (
        <div>
          {gameState === "win" && (
            <StartEndGame
              title="Tu es une incroyable génie !"
              subtitle=""
              btnText="Voir le cadeau"
              onClick={props.onSuccess}
            />
          )}
        </div>
      )}

      {/* <div id="game-3-main"> */}
      {gameState !== "intro" && (
        <div id="persons-container">
          <DndProvider
            backend={TouchBackend}
            options={{
              enableMouseEvents: true,
            }}
          >
            {persons.map((personName, index) => (
              <Person
                key={personName}
                id={personName}
                img={PERSONS_IMAGES.get(personName) ?? ""}
                index={index}
                movePerson={movePerson}
              />
            ))}
          </DndProvider>
        </div>
      )}
    </div>
  );
};
