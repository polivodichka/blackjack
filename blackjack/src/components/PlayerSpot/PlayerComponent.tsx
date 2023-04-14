import { observer } from 'mobx-react-lite';
import React, { useCallback, MouseEvent } from 'react';
import { Player } from '../../store/player';
import { game } from '../../store/game';
import { Bet } from '../BetPanel/Bet';
import { CardComponent } from '../Card/CardComponent';
import {
  CardsTotal,
  CardsWrapper,
  ChipsWrapper,
  OnePlayerWrapper,
} from './Spot.styled';
import { socket } from '../../server/socket';
import { SocketEmit } from '../../types.ds';
import { getBetColor } from '../../utils/getBetColor';

type PlayerComponentProps = {
  player: Player;
  spotId: string;
};
export const PlayerComponent: React.FC<PlayerComponentProps> = observer(
  ({ player, spotId }) => {
    const handleRemoveBet = useCallback(
      (index: number) => (e: MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (
          !game.table?.roundIsStarted &&
          game.table?.canBetAtThisSpot(spotId)
        ) {
          socket.emit(SocketEmit.remove_bet, game.table?.id, player.id, index);
        }
      },
      [player.id, spotId]
    );

    return (
      <OnePlayerWrapper
        className={player.id === game.table?.currentPlayer?.id ? 'active' : ''}
      >
        <ChipsWrapper>
          {!!player.insuranceBet && (
            <Bet value={player.insuranceBet} color="#ccff00" size={40} />
          )}
        </ChipsWrapper>
        <ChipsWrapper>
          {player.betChips.map((bet, index) => (
            <Bet
              key={`${player}-bet${index}-${bet}`}
              value={bet}
              onBetSet={handleRemoveBet(index)}
              color={getBetColor(bet)}
              size={40}
            />
          ))}
        </ChipsWrapper>
        <CardsWrapper>
          {player?.hand.map((card, index) => (
            <CardComponent
              key={`${index + card.suit}Card`}
              suit={card.suit}
              rank={card.rank}
            />
          ))}
          {player.handTotal > 0 && <CardsTotal>{player.handTotal}</CardsTotal>}
        </CardsWrapper>
      </OnePlayerWrapper>
    );
  }
);
