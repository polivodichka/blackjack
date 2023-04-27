import { observer } from 'mobx-react-lite';
import React from 'react';

import { CardsTotal, CardsWrapper, SpotStyled } from './Spot.styled';
import { CardComponent } from '../Card/CardComponent';
import { game } from '../../../store/game';
import { CardholdersIds } from '../../../types.ds';

export const DealerSpotComponent: React.FC = observer(() => {
  const dealer = game.table?.dealer;
  return (
    <SpotStyled className="dealer">
      <CardsWrapper id={CardholdersIds.Dealer}>
        {dealer?.hand.map((card) => (
          <CardComponent
            cardholderId={CardholdersIds.Dealer}
            key={`dealerCard-${card.id}`}
            suit={card.suit}
            rank={card.rank}
            id={card.id}
            isNew={card.isNew}
          />
        ))}
        {dealer && dealer.handTotal > 0 && (
          <CardsTotal>{dealer?.handTotal}</CardsTotal>
        )}
      </CardsWrapper>
    </SpotStyled>
  );
});
