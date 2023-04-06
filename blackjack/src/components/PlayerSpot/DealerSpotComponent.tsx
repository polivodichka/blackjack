import { observer } from "mobx-react-lite";
import gameTable from "../../store/table";
import { CardComponent } from "../Card/CardComponent";
import { CardsTotal, CardsWrapper, SpotStyled } from "./Spot.styled";

export const DealerSpotComponent = observer(() => {
  const dealer = gameTable.dealer;
  return (
    <SpotStyled>
      <CardsWrapper>
        {dealer &&
          dealer.hand.map((card) => (
            <CardComponent
              key={"dealerCard" + card.suit + card.rank}
              suit={card.suit}
              rank={card.rank}
            />
          ))}
        {dealer && dealer.handTotal > 0 && (
          <CardsTotal>{dealer && dealer.handTotal}</CardsTotal>
        )}
      </CardsWrapper>
    </SpotStyled>
  );
});
