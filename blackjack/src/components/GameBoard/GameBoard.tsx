import { observer } from 'mobx-react-lite';
import React from 'react';
import { socket } from '../../server/socket';
import { game } from '../../store/game';
import { EndGameActions, SocketEmit } from '../../types.ds';
import { BetPanel } from '../BetPanel/BetPanel';
import { GameActionsComponent } from '../GameActions/GameActionsComponent';
import { DealerSpotComponent } from '../PlayerSpot/DealerSpotComponent';
import { PlayerSpotComponent } from '../PlayerSpot/PlayerSpotComponent';
import { SpotsZone } from '../PlayerSpot/Spot.styled';
import {
  BalanceStyled,
  GameBoardStyled,
  GameEndComponent,
} from './GameBoard.styled';

export const GameBoard: React.FC = observer(() => {
  const handlePlayBtn = () => {
    socket.emit(SocketEmit.deal, game.table?.id);
  };

  const handleEndGame =
    (action: EndGameActions) => (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      socket.emit(SocketEmit.end_game, game.table?.id, game.player?.id, action);
    };

  if (!game.gameIsReady) {
    return <>Loading...</>;
  }

  const gameEndComponent = game.player?.roundIsEnded && (
    <GameEndComponent>
      <button onClick={handleEndGame(EndGameActions.rebet)}>rebet</button>
      <button onClick={handleEndGame(EndGameActions.newBet)}>new bet</button>
    </GameEndComponent>
  );

  const spotsZone = (
    <SpotsZone>
      {Array.from({ length: 5 }).map((_, index) => (
        <PlayerSpotComponent key={index} id={`spot-${index}`} />
      ))}
    </SpotsZone>
  );

  const playButtonOrGameStatus = game.table?.ableToStartGame ? (
    <button onClick={handlePlayBtn}>PLAY</button>
  ) : (
    <div>{game.table?.gameStatus}</div>
  );

  const gameActionsComponent = game.table?.roundIsStarted && (
    <GameActionsComponent />
  );

  return (
    <GameBoardStyled>
      <div style={{ position: 'absolute', right: 20, top: 20 }}>
        {game.gameIsReady && game.table?.id}
      </div>
      {gameEndComponent}
      <DealerSpotComponent />
      {spotsZone}
      <BetPanel />
      {playButtonOrGameStatus}
      {gameActionsComponent}
      <BalanceStyled>{game.player?.balance}</BalanceStyled>
    </GameBoardStyled>
  );
});
