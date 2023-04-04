import { FC } from "react";
import { Suit, SuitCard } from "../../types.ds";
import { CardStyled } from "./Card.styled";

type CardProps = {
  suit: Suit;
  rank: string;
};
export const CardComponent: FC<CardProps> = ({ suit, rank }) => {
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

function convertRank(rank: string) {
  switch (rank) {
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "jack":
      return "J";
    case "ace":
      return "A";
    default:
      return rank;
  }
}
