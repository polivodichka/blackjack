import React from 'react';

import { CardStyled } from '../Card/Card.styled';
import { DeckStyled } from './Deck.styled';

export const Deck: React.FC = () => {
  return (
    <DeckStyled id='deck'>
      {Array.from({ length: 60 }).map((_, index) => (
        <CardStyled
          className={`back deck Deck=${index}`}
          style={{
            zIndex: index + 1,
            transform: `translateX(${(index + 1) * .1}px) translateY(${
              (index + 1) * -1
            }px) rotateX(-40deg) rotateY(0deg) rotateZ(-60deg) scale(${
              1.3 + index * 0.0009
            }`,
          }}
          key={`Deck=${index}`}
        />
      ))}
    </DeckStyled>
  );
};
