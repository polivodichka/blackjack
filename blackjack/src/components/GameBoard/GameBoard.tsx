import { observer } from "mobx-react-lite";
import { useCallback, useEffect } from "react";
import game from "../../store/game";
import { BetPanel } from "../BetPanel/BetPanel";
import { GameActionsComponent } from "../GameActions/GameActionsComponent";
import { DealerSpotComponent } from "../PlayerSpot/DealerSpotComponent";
import { PlayerSpotComponent } from "../PlayerSpot/PlayerSpotComponent";
import { SpotsZone } from "../PlayerSpot/Spot.styled";
import {
  BalanceStyled,
  GameBoardStyled,
  GameEndComponent,
} from "./GameBoard.styled";

export const GameBoard = observer(() => {
  const dealerSpotId = "dealerSpot";
  const spots = [null, null, null, null, null];

  useEffect(() => {
    if (!(game.table && game.player)) {
      game.startGame();
    }
  }, []);

  const handlePlayBtn = useCallback(() => {
    game.table!.deal(dealerSpotId);
  }, []);
  const handleRebet = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    game.table!.rebet(game.player!);
  }, []);

  const handleNewBet = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    game.table!.removeFakePlayers(game.player!);
  }, []);
  if (!game.gameIsReady) return <>Loading...</>
  return (
    <GameBoardStyled>
      {game.player && game.player.roundIsEnded && (
        <GameEndComponent>
          <button onClick={handleRebet}>rebet</button>
          <button onClick={handleNewBet}>new bet</button>
        </GameEndComponent>
      )}
      <DealerSpotComponent />
      <>
        <SpotsZone>
          {spots.map((spot, i) => (
            <PlayerSpotComponent key={i} id={`spot-${i}`} />
          ))}
        </SpotsZone>
        <BetPanel />
      </>
      {game.table!.ableToStartGame && (
        <button onClick={handlePlayBtn}>PLAY</button>
      )}
      {game.table!.roundIsStarted && <GameActionsComponent />}

      <BalanceStyled>{game.player?.balance}</BalanceStyled>
    </GameBoardStyled>
  );
});
