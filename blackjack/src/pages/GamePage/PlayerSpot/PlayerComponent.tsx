import React, { useCallback, MouseEvent, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import {
  PlayerComponentWrapper,
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

    const cardRef = useRef<HTMLDivElement>(null);
    const activeClassName =
      player.id === game.table?.currentPlayer?.id ? 'active' : '';

    return (
      <PlayerComponentWrapper className={activeClassName}>
        <ChipsWrapper>
          {
            /**InsuranceBet */
            !!player.insuranceBet && (
              <Bet
                value={player.insuranceBet}
                color={Color.MainAccent}
                size={5.5}
                active={false}
              />
            )
          }
          {
            /**Bet */
            player.betChips.map((bet, index) => (
              <Bet
                key={`${player}-bet${index}-${bet}`}
                value={bet}
                onBetSet={handleRemoveBet(index)}
                color={getBetColor(bet)}
                size={5.5}
                active={false}
              />
            ))
          }
        </ChipsWrapper>
        <CardsWrapper ref={cardRef} id={`${spotId}Cardholder`}>
          {player?.hand.map((card) => (
            <CardComponent
              cardholderId={`${spotId}Cardholder`}
              key={`${card.id}-Card`}
              suit={card.suit}
              rank={card.rank}
              id={card.id}
              isNew={card.isNew}
            />
          ))}
          {player.handTotal > 0 && (
            <CardsTotal
              className={
                player.isBust
                  ? 'bust'
                  : player.isBJ || player.isNaturalBJ
                    ? 'bj'
                    : ''
              }
            >
              {player.handTotal}
            </CardsTotal>
          )}
        </CardsWrapper>
      </PlayerComponentWrapper>
    );
  }
);
