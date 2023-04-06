import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import gameTable from "../../store/table";
import { PlayerComponent } from "./PlayerComponent";
import { BalanceStyled, PlayersWrapper, SpotStyled } from "./Spot.styled";

type PlayerProps = {
  id: string;
};

export const PlayerSpotComponent: FC<PlayerProps> = observer(({ id }) => {
  const spotClass = useCallback(() => {
    const className = [];
    if (gameTable.currentPlayer && gameTable.currentPlayer.spotId === id)
      className.push("active");

    if (!gameTable.spots[id] && !gameTable.dealer) className.push("empty");

    return className;
  }, [gameTable.currentPlayer, gameTable.dealer, gameTable.spots.length]);

  const handleSetNewBet = useCallback(() => {
    if (!gameTable.roundIsStarted) {
      const player = gameTable.spots[id]
        ? gameTable.spots[id][0]
        : gameTable.addPlayer(id);
      player?.bet(gameTable.currentBetBtnValue);
    }
  }, []);

  return (
    <SpotStyled className={spotClass().join(" ")} onClick={handleSetNewBet}>
      <PlayersWrapper>
        {gameTable.spots[id] &&
          gameTable.spots[id].map((player) => (
            <PlayerComponent key={player.id + "-player"} player={player} />
          ))}
      </PlayersWrapper>
      <BalanceStyled>
        {gameTable.spots[id] &&
          gameTable.spots[id].filter((player) => !player.parentPlayer)[0]
            ?.balance}
      </BalanceStyled>
    </SpotStyled>
  );
});
