import "./StartEndGame.css";

type Props = {
  title: string;
  subtitle: string;
  btnText: string;
  onClick: () => void;
};

export const StartEndGame = (props: Props) => {
  const { title, subtitle, btnText, onClick } = props;

  return (
    <div id="start-game-container">
      <h1 className="title">{title}</h1>
      <h2 className="title">{subtitle}</h2>
      <button onClick={onClick}>{btnText}</button>
    </div>
  );
};
