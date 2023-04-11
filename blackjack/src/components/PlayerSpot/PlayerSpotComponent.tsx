import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import game from "../../store/game";
import { PlayerComponent } from "./PlayerComponent";
import { PlayersWrapper, SpotStyled } from "./Spot.styled";

type PlayerProps = {
  id: string;
};

export const PlayerSpotComponent: FC<PlayerProps> = observer(({ id }) => {
  const spotClass = useCallback(() => {
    const className = [];
    if (game.table!.currentPlayer && game.table!.currentPlayer.spotId === id)
      className.push("active");

    if (!game.table!.spots[id] && !game.table!.dealer) className.push("empty");

    return className;
  }, [game.table!.currentPlayer, game.table!.dealer, game.table!.spots.length]);

  const handleSetNewBet = useCallback(() => {
    if (!game.table!.roundIsStarted) {
      const player = game.table!.spots[id]
        ? game.table!.spots[id][0]
        : game.table!.addPlayer(id);
      player?.bet(game.table!.currentBetBtnValue ?? 0);
    }
  }, []);

  return (
    <SpotStyled className={spotClass().join(" ")} onClick={handleSetNewBet}>
      <PlayersWrapper>
        {game.table!.spots[id] &&
          game.table!.spots[id].map((player) => (
            <PlayerComponent key={player.id + "-player"} player={player} />
          ))}
      </PlayersWrapper>
    </SpotStyled>
  );
});
