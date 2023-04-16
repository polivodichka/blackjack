import { observer } from 'mobx-react-lite';
import React from 'react';

import { CardsTotal, CardsWrapper, SpotStyled } from './Spot.styled';
import { CardComponent } from '../Card/CardComponent';
import { game } from '../../../store/game';

export const DealerSpotComponent: React.FC = observer(() => {
  const dealer = game.table?.dealer;
  return (
    <SpotStyled>
      <CardsWrapper>
        {dealer?.hand.map((card, i) => (
          <CardComponent
            key={`dealerCard${card.suit}${card.rank}${i}`}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
        {dealer && dealer.handTotal > 0 && (
          <CardsTotal>{dealer?.handTotal}</CardsTotal>
        )}
      </CardsWrapper>
    </SpotStyled>
  );
});