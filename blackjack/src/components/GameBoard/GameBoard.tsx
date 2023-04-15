import { HandySvg } from 'handy-svg';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ButtonWithSvg, StyledBtn, toastSettings } from '../../App.styled';
import { socket } from '../../server/socket';
import { game } from '../../store/game';
import { EndGameActions, SocketEmit, SocketOn } from '../../types.ds';
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
import copyIcon from '../../assets/copy.svg';
import { toast } from 'react-toastify';

export const GameBoard: React.FC = observer(() => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!(game.table && game.player)) {
      navigate('/');
    }
  }, []);
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

  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(game.table?.id ?? '')
      .then(() => {
        toast('Table id successfully copied!', toastSettings);
      })
      .catch(() => {
        toast.error('Failed to copy!', toastSettings);
      });
  };

  const gameEndComponent = game.player?.roundIsEnded && (
    <GameEndComponent>
      <StyledBtn onClick={handleEndGame(EndGameActions.rebet)}>rebet</StyledBtn>
      <StyledBtn onClick={handleEndGame(EndGameActions.newBet)}>
        new bet
      </StyledBtn>
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
    <StyledBtn onClick={handlePlayBtn}>PLAY</StyledBtn>
  ) : (
    <div>{game.table?.gameStatus}</div>
  );

  const gameActionsComponent = game.table?.roundIsStarted && (
    <GameActionsComponent />
  );

  return (
    <GameBoardStyled>
      <div
        style={{
          position: 'absolute',
          right: 20,
          top: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <ButtonWithSvg onClick={handleCopyClick}>
          <HandySvg src={copyIcon} width="17" height="17" />
        </ButtonWithSvg>
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
