import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { HandySvg } from 'handy-svg';

import { StyledBtn, toastSettings } from '../../components/App/App.styled';
import { GameActionsComponent } from './GameActions/GameActionsComponent';
import {
  BalanceStyled,
  GameWrapper,
  OptionsPanel,
  Wrapper,
} from './GamePage.styled';
import { DealerSpotComponent } from './PlayerSpot/DealerSpotComponent';
import { PlayerSpotComponent } from './PlayerSpot/PlayerSpotComponent';
import { ModalTypes, SocketEmit, SoundType } from '../../types.ds';
import { SpotsZone } from './PlayerSpot/Spot.styled';
import moneyIcon from '../../assets/money.svg';
import { BetPanel } from './BetPanel/BetPanel';
import chatIcon from '../../assets/chat.svg';
import copyIcon from '../../assets/copy.svg';
import soundSettingsIcon from '../../assets/settings.svg';
import { game } from '../../store/game';
import { GameText } from './GameText/GameText';
import { Deck } from '../../components/Deck/Deck';
import { SvgBtnWithSound } from '../../sounds/StyledBtnWithSound';

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
    <SvgBtnWithSound soundType={SoundType.Click} onClick={handleCopyClick}>
      <HandySvg src={copyIcon} width="17" height="17" />
    </SvgBtnWithSound>
  );

  const topUpBalanceBtn = (
    <SvgBtnWithSound
      soundType={SoundType.Click}
      onClick={handleModalOpen(ModalTypes.Balance)}
      disabled={game.table?.roundIsStarted}
    >
      <HandySvg src={moneyIcon} width="17" height="17" />
    </SvgBtnWithSound>
  );
  const chatBtn = (
    <SvgBtnWithSound
      soundType={SoundType.Click}
      onClick={handleModalOpen(ModalTypes.Chat)}
    >
      <HandySvg src={chatIcon} width="17" height="17" />
    </SvgBtnWithSound>
  );
  const soundsBtn = (
    <SvgBtnWithSound
      soundType={SoundType.Click}
      onClick={handleModalOpen(ModalTypes.Sounds)}
    >
      <HandySvg src={soundSettingsIcon} width="17" height="17" />
    </SvgBtnWithSound>
  );

  return (
    <Wrapper>
      <OptionsPanel>
        {copyTableIdBtn} {chatBtn} {soundsBtn}
      </OptionsPanel>
      <BalanceStyled>
        <div>{game.player?.balance}</div>
        {topUpBalanceBtn}
      </BalanceStyled>

      <GameWrapper>
        <DealerSpotComponent />
        <GameText />

        {spotsZone}
        <Deck />
      </GameWrapper>

      <BetPanel />

      {playButtonOrGameStatus}

      {gameActionsComponent}
    </Wrapper>
  );
});
