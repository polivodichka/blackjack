import React, { useCallback } from "react";
import { BetPanel } from "../BetPanel/BetPanel";
import { DealerSeatComponent } from "../PlayerSeat/DealerSeatComponent";
import { PlayerSeatComponent } from "../PlayerSeat/PlayerSeatComponent";
import { SeatsZone } from "../PlayerSeat/Seat.styled";
import gameTable from "../../store/table";
import { GameBoardStyled } from "./GameBoard.styled";
import { observer } from "mobx-react-lite";
import { GameActionsComponent } from "../GameActions/GameActionsComponent";

type GameBoardProps = {
  currentPlayerId: string; //вообще это надо тянуть из состояния игры
};

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
        <button onClick={handlePlayBtn}>PLAY</button>
      )}
      {gameTable.roundIsStarted && <GameActionsComponent />}
    </GameBoardStyled>
  );
});
