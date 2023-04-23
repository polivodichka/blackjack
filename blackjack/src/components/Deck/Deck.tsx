import React from 'react';
import { CardStyled } from '../../pages/GamePage/Card/Card.styled';
import { DeckStyled } from './Deck.styled';

export const Deck: React.FC = () => {
  return (
    <DeckStyled>
      {Array.from({ length: 60 }).map((_, index) => (
        <CardStyled
          className={`back deck Deck=${index}`}
          style={{
            zIndex: index + 1,
            transform: `translateX(${(index + 1) * .25}px) translateY(${
              (index + 1) * -1
            }px) rotateX(-40deg) rotateY(20deg) rotateZ(-40deg) scale(${
              1 + index * 0.0009
            }`,
          }}
          key={`Deck=${index}`}
        />
      ))}
    </DeckStyled>
  );
};
