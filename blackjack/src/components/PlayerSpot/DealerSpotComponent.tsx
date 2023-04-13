import { observer } from "mobx-react-lite";
import game from "../../store/game";
import { CardComponent } from "../Card/CardComponent";
import { CardsTotal, CardsWrapper, SpotStyled } from "./Spot.styled";

export const DealerSpotComponent = observer(() => {
  const dealer = game.table!.dealer;
  return (
    <SpotStyled>
      <CardsWrapper>
        {dealer &&
          dealer.hand.map((card, i) => (
            <CardComponent
              key={"dealerCard" + card.suit + card.rank + i}
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
