import React, { useMemo } from 'react';

import { Rank, Suit, SuitCard } from '../../../types.ds';
import { CardStyled, CardWrap } from './Card.styled';

type CardProps = {
  suit: Suit;
  rank: Rank;
  id: string;
  isNew: boolean;
  cardholderId: string;
};
export const CardComponent: React.FC<CardProps> = ({
  suit,
  rank,
  id,
  isNew,
  cardholderId,
}) => {
  const shortRank = convertRank(rank);
  const deck = document.getElementById('deck');
  const card = document.getElementById(cardholderId);

  const initialOffset = useMemo(() => {
    if (!deck?.firstElementChild || !card) {
      return { x: 0, y: 0, z: 0, rotate: 0 };
    }
    const cardRect = card.getBoundingClientRect();
    const deckRect = deck.firstElementChild.getBoundingClientRect();
    let angle = 0;

    const result = {
      x: deckRect.left + deckRect.width - cardRect.left,
      y: deckRect.bottom - cardRect.top - cardRect.height,
      z: 0,
      rotate: 0,
    };
    switch (cardholderId) {
      case 'spot-0Cardholder':
        angle = ((90 - 45 * 1.5) * Math.PI) / 180;
        result.y -= result.x * 2 * Math.sqrt(1 - Math.cos(angle));
        result.rotate = 100;
        break;
      case 'spot-1Cardholder':
        angle = ((90 - 45 * 1.7) * Math.PI) / 180;
        result.y -= result.x * 2 * Math.sqrt(1 - Math.cos(angle));
        result.rotate = 113;
        break;

      default:
        break;
    }
    return result;
  }, [card, cardholderId, deck?.firstElementChild]);

  return (
    <CardWrap
      initial={isNew ? { ...initialOffset } : { x: 0, y: 0, z: 0, rotate: 0 }}
      transition={{
        type: 'spring',
        duration: 1,
      }}
      animate={{ x: 0, y: 0, z: 0, rotate: 0 }}
    >
      <CardStyled
        initial={isNew ? { rotateY: 180 } : { rotateY: 360 }}
        transition={{
          type: 'spring',
          duration: 1,
        }}
        animate={{ rotateY: 360 }}
        className={`face ${suit}`}
        id={`face-${id}`}
      >
        <div className="rank" data-suit={SuitCard[suit]}>
          {shortRank}
        </div>
        <div className="suit">{SuitCard[suit]}</div>
        <div className="rank" data-suit={SuitCard[suit]}>
          {shortRank}
        </div>
      </CardStyled>

      <CardStyled
        initial={isNew ? { rotateY: 0 } : { rotateY: 180 }}
        transition={{
          type: 'spring',
          duration: 1,
        }}
        animate={{ rotateY: 180 }}
        className="back"
        id={`back-${id}`}
      />
    </CardWrap>
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
