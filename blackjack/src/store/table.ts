import { observable, action, makeObservable, computed, autorun } from "mobx";
import { PlayerGameState, Suit } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { Player } from "./player";

class Table {
  @observable players: Player[] = [];
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
        this.countWinnings();
      }
      if (
        this.currentPlayer &&
        this.currentPlayer.state === PlayerGameState.bust
      ) {
        this.stand();
      }
    });
  }

  @computed get ableToStartGame(): boolean {
    return (
      this.players.length > 0 &&
      !this.dealer &&
      this.players.every(
        (player) => player.betChipsTotal > 0 || player.parentPlayer
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

  @computed get seats(): {
    [key: string]: Player[];
  } {
    return this.players.reduce<{ [key: string]: Player[] }>(
      (result, player) => {
        if (!result[player.seatId]) {
          result[player.seatId] = [];
        }
        result[player.seatId].push(player);
        return result;
      },
      {}
    );
  }

  @computed get needInsurance(): boolean {
    return !!!(
      this.dealer && this.dealer.hand.find((card) => card.rank === "ace")
    );
  }

  @action setCurrentBetBtnValue(value: number): void {
    this.currentBetBtnValue = value;
  }

  @action addPlayer(seatId: string): Player {
    const player = this.players.find((player) => player.seatId === seatId);
    if (!player) {
      const newPlayer = new Player(seatId);
      this.players.push(newPlayer);
      return newPlayer;
    }
    return player;
  }

  @action deal(dealerId: string): void {
    //remove players from previous game
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].roundIsEnded) {
        this.players.splice(i, 1);
        i--;
      }
    }

    this.dealer = new Dealer(dealerId);
    this.createDeck();
    this.shuffleDeck();
    this.players.forEach((player) => {
      player.hand = [this.draw(), this.draw()];
    });
    this.dealer.hand = [this.draw()];

    this.currentPlayerIndex = 0;
  }

  @action hit(): void {
    this.currentPlayer!.hand.push(this.draw());
  }

  @action stand(): void {
    this.currentPlayerIndex!++;
  }

  @action split() {
    if (this.currentPlayer && this.currentPlayerIndex !== null) {
      const subPlayer = new Player(this.currentPlayer.seatId);
      subPlayer.parentPlayer = this.currentPlayer;
      subPlayer.hand = this.currentPlayer.hand.splice(1, 1);
      subPlayer.betChips = [...this.currentPlayer.betChips];
      this.currentPlayer.balance -= this.currentPlayer.betChipsTotal;

      this.currentPlayer.hand.push(this.draw());
      subPlayer.hand.push(this.draw());

      this.players.splice(this.currentPlayerIndex, 0, subPlayer);
    }
  }

  @action double(): void {
    const player = this.currentPlayer;
    if (player && player.betChipsTotal <= player.balance) {
      player.parentPlayer
        ? (player.parentPlayer.balance -= player.betChipsTotal)
        : (player.balance -= player.betChipsTotal);
      player.betChips = player.betChips.concat(player.betChips);
      this.hit();
      this.stand();
    } else alert("Insufficient funds");
  }

  @action insurance(): void {
    this.currentPlayer &&
      this.currentPlayer.insuarence.push(this.currentPlayer?.betChipsTotal / 2);
  }

  @action draw(): Card {
    return this.deck.shift() as Card;
  }

  @action createDeck(): void {
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
        this.deck.push(new Card(suit, rank.rank, rank.value));
      }
    }
  }

  @action shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  @action playerRemove(playerForRemoving: Player): void {
    const index = this.players.indexOf(playerForRemoving);
    index >= 0 && this.players.splice(index, 1);
  }

  @action countWinnings() {
    this.players.forEach((player) => {
      const betSum = player.betChipsTotal;
      switch (player.state) {
        case PlayerGameState["natural blackjack"]:
          player.parentPlayer
            ? (player.parentPlayer.balance += betSum * 2.5)
            : (player.balance += betSum * 2.5);
          break;
        case PlayerGameState.blackjack:
          if (this.dealer?.handTotal === 21) {
            player.parentPlayer
              ? (player.parentPlayer.balance += betSum)
              : (player.balance += betSum);
          } else
            player.parentPlayer
              ? (player.parentPlayer.balance += betSum * 2)
              : (player.balance += betSum * 2);
          break;
        case PlayerGameState.active:
          if (
            this.dealer &&
            (this.dealer.handTotal < player.handTotal ||
              this.dealer.handTotal > 21)
          ) {
            player.parentPlayer
              ? (player.parentPlayer.balance += betSum * 2)
              : (player.balance += betSum * 2);
          } else if (
            this.dealer &&
            this.dealer.handTotal === player.handTotal
          ) {
            player.parentPlayer
              ? (player.parentPlayer.balance += betSum)
              : (player.balance += betSum);
          }
          break;
      }
      player.roundIsEnded = true;
    });
  }
}

export default new Table();
