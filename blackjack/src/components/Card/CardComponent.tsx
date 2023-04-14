import React from 'react';
import { Rank, Suit, SuitCard } from '../../types.ds';
import { CardStyled } from './Card.styled';

type CardProps = {
  suit: Suit;
  rank: Rank;
};
export const CardComponent: React.FC<CardProps> = ({ suit, rank }) => {
  const shortRank = convertRank(rank);
  return (
    <CardStyled className={`face ${suit}`}>
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
    case Rank.king:
    case Rank.queen:
    case Rank.jack:
    case Rank.ace:
      return rank.charAt(0).toUpperCase();
    default:
      return rank;
  }
}
