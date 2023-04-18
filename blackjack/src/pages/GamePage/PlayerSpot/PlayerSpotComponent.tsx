import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';

import { PlayersWrapper, SpotStyled, OnePlayerWrapper } from './Spot.styled';
import { PlayerGameState, SocketEmit } from '../../../types.ds';
import { PlayerComponent } from './PlayerComponent';
import { game } from '../../../store/game';

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

    return className.join(' ');
  }, [gameTable?.currentPlayer, gameTable?.dealer, gameTable?.spots, id]);

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
    <OnePlayerWrapper>
      <div>{game.getNameBySpotId(id)}</div>
      <SpotStyled className={spotClass} onClick={handleSetNewBet}>
        <PlayersWrapper>
          {gameTable?.spots[id] &&
            gameTable.spots[id].map((player) => (
              <OnePlayerWrapper key={`${player.id}-player`}>
                <div>
                  {(player.state === PlayerGameState.Blackjack ||
                    player.state === PlayerGameState.NaturalBlackjack ||
                    player.state === PlayerGameState.Bust) &&
                    player.state}
                </div>
                <PlayerComponent player={player} spotId={id} />
              </OnePlayerWrapper>
            ))}
        </PlayersWrapper>
      </SpotStyled>
    </OnePlayerWrapper>
  );
});
