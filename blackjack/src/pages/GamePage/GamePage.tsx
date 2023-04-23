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
import {
  BalanceStyled,
  GameWrapper,
  OptionsPanel,
  Wrapper,
} from './GamePage.styled';
import { DealerSpotComponent } from './PlayerSpot/DealerSpotComponent';
import { PlayerSpotComponent } from './PlayerSpot/PlayerSpotComponent';
import { ModalTypes, SocketEmit } from '../../types.ds';
import { SpotStyled, SpotsZone, SpotWrapper } from './PlayerSpot/Spot.styled';
import moneyIcon from '../../assets/money.svg';
import { BetPanel } from './BetPanel/BetPanel';
import chatIcon from '../../assets/chat.svg';
import copyIcon from '../../assets/copy.svg';
import { game } from '../../store/game';
import { GameText } from './GameText/GameText';
import { Deck } from '../../components/Deck/Deck';

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
    game.emit[SocketEmit.Deal]();
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
  const handleModalOpen = (type: ModalTypes) => () => {
    game.modalUpdate(false, type);
  };

  const spotsZone = (
    <SpotsZone>
      {Array.from({ length: 5 }).map((_, index) => (
        <PlayerSpotComponent key={index} id={`spot-${index}`} />
      ))}
    </SpotsZone>
  );

  const playButtonOrGameStatus =
    game.table?.ableToStartGame && game.player?.betChipsTotalWithChildren ? (
      <StyledBtn onClick={handlePlayBtn}>PLAY</StyledBtn>
    ) : game.table?.ableToStartGame ? (
      <div>No empty spots left</div>
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
      onClick={handleModalOpen(ModalTypes.Balance)}
      disabled={game.table?.roundIsStarted}
    >
      <HandySvg src={moneyIcon} width="17" height="17" />
    </ButtonWithSvg>
  );
  const chatBtn = (
    <ButtonWithSvg onClick={handleModalOpen(ModalTypes.Chat)}>
      <HandySvg src={chatIcon} width="17" height="17" />
    </ButtonWithSvg>
  );

  return (
    <Wrapper>
      <OptionsPanel>
        {copyTableIdBtn} {chatBtn}
      </OptionsPanel>
      <BalanceStyled>
        <div>{game.player?.balance}</div>
        {topUpBalanceBtn}
      </BalanceStyled>

      <GameWrapper>
        <DealerSpotComponent />
        <Deck />
        <GameText />

        {spotsZone}
      </GameWrapper>

      <BetPanel />

      {playButtonOrGameStatus}

      {gameActionsComponent}
    </Wrapper>
  );
});
