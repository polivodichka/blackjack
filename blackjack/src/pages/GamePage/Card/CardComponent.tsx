import React from 'react';

import { Rank, Suit, SuitCard } from '../../../types.ds';
import { CardStyled } from './Card.styled';

type CardProps = {
  suit: Suit;
  rank: Rank;
  id: string;
};
export const CardComponent: React.FC<CardProps> = ({ suit, rank, id }) => {
  const shortRank = convertRank(rank);
  return (
    <CardStyled className={`face ${suit}`} id={id}>
      <div className="rank" data-suit={SuitCard[suit]}>
        {shortRank}
      </div>
      <div className="suit">{SuitCard[suit]}</div>
      <div className="rank" data-suit={SuitCard[suit]}>
        {shortRank}
      </div>
    </CardStyled>
  );
};

function convertRank(rank: Rank) {
  switch (rank) {
    case Rank.King:
    case Rank.Queen:
    case Rank.Jack:
    case Rank.Ace:
      return rank.charAt(0).toUpperCase();
    default:
      return rank;
  }
}
