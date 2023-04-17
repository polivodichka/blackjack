import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { HandySvg } from 'handy-svg';

import {
  ButtonWithSvg,
  toastSettings,
  StyledBtn,
} from '../../components/App/App.styled';
import { GameActionsComponent } from './GameActions/GameActionsComponent';
import { BalanceStyled, OptionsPanel, Wrapper } from './GamePage.styled';
import { DealerSpotComponent } from './PlayerSpot/DealerSpotComponent';
import { PlayerSpotComponent } from './PlayerSpot/PlayerSpotComponent';
import { ModalTypes, SocketEmit } from '../../types.ds';
import { SpotsZone } from './PlayerSpot/Spot.styled';
import moneyIcon from '../../assets/money.svg';
import { BetPanel } from './BetPanel/BetPanel';
import { socket } from '../../server/socket';
import copyIcon from '../../assets/copy.svg';
import { game } from '../../store/game';

export const GamePage: React.FC = observer(() => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!(game.table && game.player)) {
      navigate('/');
      game.modalUpdate(false, ModalTypes.CreateOrJoin);
    }
  }, [navigate]);

  useEffect(() => {
    if (game.player?.roundIsEnded) {
      game.modalUpdate(false, ModalTypes.GameEnd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.player?.roundIsEnded]);

  const handlePlayBtn = () => {
    socket.emit(SocketEmit.deal, game.table?.id);
  };

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
  const handleTopUpClick = () => {
    game.modalUpdate(false, ModalTypes.Balance);
  };

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

  const copyTableIdBtn = (
    <ButtonWithSvg onClick={handleCopyClick}>
      <HandySvg src={copyIcon} width="17" height="17" />
    </ButtonWithSvg>
  );

  const topUpBalanceBtn = (
    <ButtonWithSvg
      onClick={handleTopUpClick}
      disabled={game.table?.roundIsStarted}
    >
      <HandySvg src={moneyIcon} width="17" height="17" />
    </ButtonWithSvg>
  );

  return (
    <Wrapper>
      <OptionsPanel> {copyTableIdBtn}</OptionsPanel>
      <BalanceStyled>
        <div>{game.player?.balance}</div>
        {topUpBalanceBtn}
      </BalanceStyled>

      <DealerSpotComponent />

      {spotsZone}

      <BetPanel />

      {playButtonOrGameStatus}

      {gameActionsComponent}
    </Wrapper>
  );
});
