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
import { socket } from "../../server/socket";
import { EndGameActions, SocketEmit } from "../../types.ds";

export const GameBoard = observer(() => {
  const spots = [null, null, null, null, null];

  useEffect(() => {
    if (!(game.table && game.player)) {
    }
  }, []);

  const handlePlayBtn = useCallback(() => {
    socket.emit(SocketEmit.deal, game.table?.id);
  }, []);
  const handleEndGame = useCallback(
    (action: EndGameActions) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      socket.emit(SocketEmit.end_game, game.table?.id, game.player?.id, action);
    },
    []
  );

  if (!game.gameIsReady) return <>Loading...</>;
  return (
    <GameBoardStyled>
      <div style={{ position: "absolute", right: 20, top: 20 }}>
        {game.gameIsReady && game.table!.id}
      </div>
      {game.player && game.player.roundIsEnded && (
        <GameEndComponent>
          <button onClick={handleEndGame(EndGameActions.rebet)}>rebet</button>
          <button onClick={handleEndGame(EndGameActions.newBet)}>
            new bet
          </button>
        </GameEndComponent>
      )}
      <DealerSpotComponent />
      <>
        <SpotsZone>
          {spots.map((_, i) => (
            <PlayerSpotComponent key={i} id={`spot-${i}`} />
          ))}
        </SpotsZone>
        <BetPanel />
      </>
      {game.table!.ableToStartGame ? (
        <button onClick={handlePlayBtn}>PLAY</button>
      ) : (
        <div>{game.table?.gameStatus}</div>
      )}
      {game.table!.roundIsStarted && <GameActionsComponent />}

      <BalanceStyled>{game.player?.balance}</BalanceStyled>
    </GameBoardStyled>
  );
});
