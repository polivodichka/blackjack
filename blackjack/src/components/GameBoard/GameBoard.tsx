import { nanoid } from "nanoid";
import React, { useCallback, useEffect } from "react";
import { BetPanel } from "../BetPanel/BetPanel";
import { Dealer } from "../Players/Dealer";
import { PlayerComponent } from "../Players/Player";
import { PlayersZone } from "../Players/Player.styled";
import game from "../../store/table";
import { GameBoardStyled } from "./GameBoard.styled";
import { observer } from "mobx-react-lite";
import { GameActionsComponent } from "../GameActions/GameActionsComponent";
type GameBoardProps = {
  currentPlayerId: string; //вообще это надо тянуть из состояния игры
};
export const GameBoard = observer(() => {
  const dealerSeatId = nanoid();
  const seats = [];
  for (let i = 0; i < 5; i++) {
    seats.push(<PlayerComponent key={i} id={nanoid()} />);
  }
  const handlePlayBtn = useCallback(() => {
    game.deal(dealerSeatId);
  }, []);
  return (
    <GameBoardStyled>
      <Dealer />
      <>
        <PlayersZone>{seats}</PlayersZone>
        <BetPanel />
      </>
      {game.ableToStartGame && <button onClick={handlePlayBtn}>PLAY</button>}
      {game.roundIsStarted && <GameActionsComponent />}
    </GameBoardStyled>
  );
});
