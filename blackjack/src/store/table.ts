import { action, autorun, computed, makeObservable, observable } from "mobx";
import { PlayerGameState, PlayerType, Suit } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { Player } from "./player";
import { nanoid } from "nanoid";
import game from "./game";

export class Table {
  readonly id: string = nanoid();
  @observable allPlayers: Player[] = [];
  @observable dealer: Dealer | null = null;
  @observable currentPlayerIndex: number | null = null;
  @observable deck: Card[] = [];
  @observable currentBetBtnValue: number = 2;

  constructor() {
    makeObservable(this);
    autorun(() => {
      if (this.dealer && this.currentPlayerIndex! === this.players.length) {
        this.currentPlayerIndex = null;
        while (this.dealer.canHit) this.dealer.hand.push(this.draw());
        {
          this.countWinnings();
        }
      }
      if (this.currentPlayer && this.currentPlayer.isBust) {
        this.stand();
      }
    });
  }

  @computed get players(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType !== PlayerType.parent
    );
  }
  @computed get ableToStartGame(): boolean {
    console.log(this.dealer);
    console.log(this.allPlayers);
    return (
      this.players.length > 0 &&
      !this.dealer &&
      this.players.every(
        (player) => player.betChipsTotal || player.parentAfterSplitPlayer
      )
    );
  }

  @computed get roundIsStarted(): boolean {
    return this.players.length > 0 && !!this.dealer;
  }

  @computed get currentPlayer(): Player | null {
    return typeof this.currentPlayerIndex === "number"
      ? this.players[this.currentPlayerIndex]
      : null;
  }

  @computed get spots(): {
    [key: string]: Player[];
  } {
    return this.players.reduce<{ [key: string]: Player[] }>(
      (result, player) => {
        if (!result[player.spotId]) {
          result[player.spotId] = [];
        }
        result[player.spotId].push(player);
        return result;
      },
      {}
    );
  }

  @computed get needInsurance(): boolean {
    return Boolean(
      this.dealer && this.dealer.hand.find((card) => card.rank === "ace")
    );
  }

  @action.bound setCurrentBetBtnValue(value: number): void {
    this.currentBetBtnValue = value;
  }

  @action.bound addPlayer(spotId: string): Player {
    console.log(this.players);
    const player = this.players.find((player) => player.spotId === spotId);
    if (!player) {
      const newPlayer = new Player(spotId);
      newPlayer.parentPlayer = game.player;
      this.allPlayers.push(newPlayer);
      return newPlayer;
    }
    return player;
  }

  @action.bound playerRemove(playerForRemoving: Player): void {
    const subPlayers = this.players.filter(
      (player) => player.parentAfterSplitPlayer?.id === playerForRemoving.id
    );
    subPlayers.push(playerForRemoving);
    subPlayers.forEach((player) => {
      const index = this.allPlayers.indexOf(player);
      index >= 0 && this.allPlayers.splice(index, 1);
    });
    if (!this.players.length) this.dealer = null;
  }

  @action.bound rebet(parent: Player) {
    console.log(parent, this.players);
    this.players
      .filter((player) => player.parentPlayer!.id === parent.id)
      .map((player) => {
        player.reset();
      });
    parent.roundIsEnded = false;
  }
  @action.bound removeFakePlayers(parent: Player) {
    console.log(parent, this.players);

    this.players
      .filter((player) => player.parentPlayer!.id === parent.id)
      .map((player) => {
        this.playerRemove(player);
      });
    parent.roundIsEnded = false;
  }

  @action.bound deal(dealerId: string): void {
    //remove players from previous game
    // for (let i = 0; i < this.players.length; i++) {
    //   if (this.players[i].roundIsEnded) {
    //     this.players.splice(i, 1);
    //     i--;
    //   }
    // }

    this.dealer = new Dealer(dealerId);
    this.createDeck();
    this.shuffleDeck();
    this.players.forEach((player) => {
      player.hand = [this.draw(), this.draw()];
    });
    this.dealer.hand = [this.draw()];

    this.currentPlayerIndex = 0;
  }

  @action.bound hit(): void {
    this.currentPlayer!.hand.push(this.draw());
  }

  @action.bound stand(): void {
    this.currentPlayerIndex!++;
  }

  @action.bound split() {
    const player = this.currentPlayer;
    if (player && this.currentPlayerIndex !== null) {
      if (player.betChipsTotal <= player.balance) {
        const subPlayer = new Player(player.spotId);
        subPlayer.parentAfterSplitPlayer = player;
        subPlayer.parentPlayer = player.parentPlayer;
        subPlayer.hand = player.hand.splice(1, 1);
        subPlayer.betChips = [...player.betChips];
        player.decreaseBalance(player.betChipsTotal);

        player.hand.push(this.draw());
        subPlayer.hand.push(this.draw());

        const index = this.currentPlayer
          ? this.allPlayers.indexOf(this.currentPlayer)
          : -1;
        index >= 0 && this.allPlayers.splice(index, 0, subPlayer);
      } else alert("Insufficient funds");
    }
  }

  @action.bound double(): void {
    const player = this.currentPlayer;
    if (player && player.betChipsTotal <= player.balance) {
      player.decreaseBalance(player.betChipsTotal);
      player.betChips = player.betChips.concat(player.betChips);
      this.hit();
      this.stand();
    } else alert("Insufficient funds");
  }

  @action.bound draw(): Card {
    return this.deck.shift() as Card;
  }

  @action.bound createDeck(): void {
    const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
      { rank: "ace", value: 11 },
      { rank: "2", value: 2 },
      { rank: "3", value: 3 },
      { rank: "4", value: 4 },
      { rank: "5", value: 5 },
      { rank: "6", value: 6 },
      { rank: "7", value: 7 },
      { rank: "8", value: 8 },
      { rank: "9", value: 9 },
      { rank: "10", value: 10 },
      { rank: "jack", value: 10 },
      { rank: "queen", value: 10 },
      { rank: "king", value: 10 },
    ];

    for (const suit of suits) {
      for (const rank of ranks) {
        for (let i = 0; i < 6; i++) {
          //6 decks
          this.deck.push(new Card(suit, rank.rank, rank.value));
        }
      }
    }
  }

  @action.bound shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  @action.bound countWinnings() {
    this.players.forEach((player) => {
      const betSum = player.betChipsTotal;
      const insurance = player.insuranceBet ?? 0;
      if (this.dealer) {
        //insurance
        if (this.dealer.isNaturalBJ) player.increaseBalance(insurance * 2);

        switch (player.state) {
          case PlayerGameState["natural blackjack"]:
            player.increaseBalance(betSum * 2.5);
            break;

          case PlayerGameState.blackjack:
            if (this.dealer.isBJ || this.dealer.isNaturalBJ) {
              player.increaseBalance(betSum);
            } else player.increaseBalance(betSum * 2);
            break;

          case PlayerGameState.active:
            if (
              this.dealer.handTotal < player.handTotal ||
              this.dealer.isBust
            ) {
              player.increaseBalance(betSum * 2);
            } else if (this.dealer.handTotal === player.handTotal) {
              player.increaseBalance(betSum);
            }
            break;
        }
      }
      player.parentPlayer!.roundIsEnded = true;
    });
  }
}
