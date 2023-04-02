import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import table from "../../store/table";
import { CardComponent } from "../Card/CardComponent";
import { CardsWrapper, PlayerStyled } from "./Player.styled";

export const Dealer = observer(() => {
  const dealer = table.dealer;
  return (
    <>
      {dealer && dealer.handTotal}
      <PlayerStyled>
        <CardsWrapper>
          {dealer &&
            dealer.hand.map((card) => (
              <CardComponent
                key={"dealerCard" + card.suit + card.rank}
                suit={card.suit}
                rank={card.rank}
              />
            ))}
        </CardsWrapper>
      </PlayerStyled>
    </>
  );
});
