import { observer } from "mobx-react-lite";
import { FC, useCallback } from "react";
import gameTable from "../../store/table";
import { PlayerComponent } from "./PlayerComponent";
import { PlayersWrapper, SeatStyled } from "./Seat.styled";

type PlayerProps = {
  id: string;
};

export const PlayerSeatComponent: FC<PlayerProps> = observer(({ id }) => {
  const handleSetNewBet = useCallback(() => {
    console.log("click", gameTable.roundIsStarted);
    if (!gameTable.roundIsStarted) {
      const player = gameTable.addPlayer(id);
      console.log("click", player);

      player?.bet(gameTable.currentBetBtnValue);
    }
  }, []);

  return (
    <>
      <SeatStyled
        className={
          gameTable.currentPlayer && gameTable.currentPlayer.seatId === id
            ? "active"
            : ""
        }
        onClick={handleSetNewBet}
      >
        <PlayersWrapper>
          {gameTable.seats[id] &&
            gameTable.seats[id].map((player) => (
              <PlayerComponent key={player.id + "-player"} player={player} />
            ))}
        </PlayersWrapper>
      </SeatStyled>
    </>
  );
});
