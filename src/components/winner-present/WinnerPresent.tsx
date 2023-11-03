import "./WinnerPresent.css";

import giftImg from "../../assets/gift.jpg";

/**
 * Final screen
 */
export const WinnerPresent = () => {
  return (
    <div className="game-container" id="present-container">
      <h1>Joyeux anniversaire Marine !</h1>
      <h4>
        Une carte cadeau (pas manuelle) Fnac / Darty d'une valeur de 15€ pour te
        faire plaisir
      </h4>
      <img width="265" src={giftImg} />
    </div>
  );
};
