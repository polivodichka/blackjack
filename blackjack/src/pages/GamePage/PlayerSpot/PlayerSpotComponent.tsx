import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';

import { PlayersWrapper, SpotStyled, OnePlayerWrapper } from './Spot.styled';
import { PlayerComponent } from './PlayerComponent';
import { socket } from '../../../server/socket';
import { SocketEmit } from '../../../types.ds';
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
      socket.emit(
        SocketEmit.set_bet,
        gameTable.id,
        id,
        game.player?.id,
        gameTable.currentBetBtnValue ?? 0
      );
    }
  };

  return (
    <OnePlayerWrapper>
      <div>{game.getNameBySpotId(id)}</div>
      <SpotStyled className={spotClass} onClick={handleSetNewBet}>
        <PlayersWrapper>
          {gameTable?.spots[id] &&
            gameTable.spots[id].map((player) => (
              <PlayerComponent
                key={`${player.id}-player`}
                player={player}
                spotId={id}
              />
            ))}
        </PlayersWrapper>
      </SpotStyled>
    </OnePlayerWrapper>
  );
});
