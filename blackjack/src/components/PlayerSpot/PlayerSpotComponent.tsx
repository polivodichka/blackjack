import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import game from "../../store/game";
import { PlayerComponent } from "./PlayerComponent";
import { PlayersWrapper, SpotStyled } from "./Spot.styled";
import { socket } from "../../server/socket";
import { SocketEmit } from "../../types.ds";

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
    game.table?.canBetAtThisSpot(id) &&
      socket.emit(
        SocketEmit.set_bet,
        game.table!.id,
        id,
        game.player?.id,
        game.table!.currentBetBtnValue ?? 0
      );
  }, []);

  return (
    <SpotStyled className={spotClass().join(" ")} onClick={handleSetNewBet}>
      <PlayersWrapper>
        {game.table!.spots[id] &&
          game.table!.spots[id].map((player) => (
            <PlayerComponent
              key={player.id + "-player"}
              player={player}
              spotId={id}
            />
          ))}
      </PlayersWrapper>
    </SpotStyled>
  );
});
