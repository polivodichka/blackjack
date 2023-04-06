import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import gameTable from "../../store/table";
import { BetPanel } from "../BetPanel/BetPanel";
import { GameActionsComponent } from "../GameActions/GameActionsComponent";
import { DealerSeatComponent } from "../PlayerSeat/DealerSeatComponent";
import { PlayerSeatComponent } from "../PlayerSeat/PlayerSeatComponent";
import { SeatsZone } from "../PlayerSeat/Seat.styled";
import { GameBoardStyled } from "./GameBoard.styled";

export const GameBoard = observer(() => {
  const dealerSeatId = "dealerSeat";
  const seats = [];
  for (let i = 0; i < 5; i++) {
    seats.push(<PlayerSeatComponent key={i} id={`seat-${i}`} />);
  }
  const handlePlayBtn = useCallback(() => {
    gameTable.deal(dealerSeatId);
  }, []);
  return (
    <GameBoardStyled>
      <DealerSeatComponent />
      <>
        <SeatsZone>{seats}</SeatsZone>
        <BetPanel />
      </>
      {gameTable.ableToStartGame && (
        <button onClick={handlePlayBtn}>
          PLAY
        </button>
      )}
      {gameTable.roundIsStarted && <GameActionsComponent />}
    </GameBoardStyled>
  );
});
