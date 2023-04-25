import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';

import {
  PlayersWrapper,
  SpotStyled,
  OnePlayerWrapper,
  SpotWrapper,
  Name,
} from './Spot.styled';
import { PlayerGameState, SocketEmit, SoundType } from '../../../types.ds';
import { PlayerComponent } from './PlayerComponent';
import { game } from '../../../store/game';
import { Player } from '../../../store/player';

type PlayerProps = {
  id: string;
};

export const PlayerSpotComponent: React.FC<PlayerProps> = observer(({ id }) => {
  const gameTable = game.table ?? null;

  const spotClass = useMemo(() => {
    const className = [];
    if (gameTable?.currentPlayer && gameTable.currentPlayer.spotId === id) {
      className.push('active');
    }

    if (!gameTable?.spots[id] && !gameTable?.dealer) {
      className.push('empty');
    }

    if (gameTable?.roundIsStarted) {
      className.push('disabled');
    }

    return className.join(' ');
  }, [
    gameTable?.currentPlayer,
    gameTable?.dealer,
    gameTable?.roundIsStarted,
    gameTable?.spots,
    id,
  ]);

  const playerClass = (player: Player) => {
    const className = [];
    if (
      (player.state === PlayerGameState.Blackjack ||
        player.state === PlayerGameState.NaturalBlackjack ||
        player.state === PlayerGameState.Win) &&
      player.state
    ) {
      className.push('win');
    }
    if (
      (player.state === PlayerGameState.Loose ||
        player.state === PlayerGameState.Bust) &&
      player.state
    ) {
      className.push('loose');
    }
    return className.join(' ');
  };

  const handleSetNewBet = () => {
    if (
      gameTable &&
      game.player?.canBetAtThisSpot(id) &&
      !gameTable?.roundIsStarted
    ) {
      game.emit[SocketEmit.SetBet](id);
    }
  };

  return (
    <SpotWrapper className="spot">
      <Name>{game.getNameBySpotId(id)}</Name>
      <SpotStyled
        onClick={handleSetNewBet}
        className={spotClass}
        soundType={SoundType.Chip}
      >
        <PlayersWrapper>
          {gameTable?.spots[id] &&
            gameTable.spots[id].map((player) => (
              <OnePlayerWrapper
                key={`${player.id}-player`}
                className={playerClass(player)}
              >
                <PlayerComponent player={player} spotId={id} />
              </OnePlayerWrapper>
            ))}
        </PlayersWrapper>
      </SpotStyled>
    </SpotWrapper>
  );
});
