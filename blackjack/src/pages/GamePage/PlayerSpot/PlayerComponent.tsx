import React, { useCallback, MouseEvent } from 'react';
import { observer } from 'mobx-react-lite';

import {
  OnePlayerWrapper,
  CardsWrapper,
  ChipsWrapper,
  CardsTotal,
} from './Spot.styled';
import { getBetColor } from '../../../utils/getBetColor';
import { CardComponent } from '../Card/CardComponent';
import { Color } from '../../../constants/constants';
import { Player } from '../../../store/player';
import { SocketEmit } from '../../../types.ds';
import { game } from '../../../store/game';
import { Bet } from '../BetPanel/Bet';

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
          game.player?.canBetAtThisSpot(spotId)
        ) {
          game.emit[SocketEmit.RemoveBet](player.id, index);
        }
      },
      [player.id, spotId]
    );

    const activeClassName =
      player.id === game.table?.currentPlayer?.id ? 'active' : '';

    return (
      <OnePlayerWrapper className={activeClassName}>
        <ChipsWrapper>
          {!!player.insuranceBet && (
            <Bet
              value={player.insuranceBet}
              color={Color.MainAccent}
              size={40}
              active={false}
            />
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
              active={false}
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
