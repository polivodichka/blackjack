import { observer } from "mobx-react-lite";
import gameTable from "../../store/table";
import { CardComponent } from "../Card/CardComponent";
import { CardsWrapper, SeatStyled } from "./Seat.styled";

export const DealerSeatComponent = observer(() => {
  const dealer = gameTable.dealer;
  return (
    <>
      {dealer && dealer.handTotal}
      <SeatStyled>
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
      </SeatStyled>
    </>
  );
});
