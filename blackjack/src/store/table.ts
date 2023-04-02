import { observable, action, makeObservable, computed, autorun } from "mobx";
import { Suit } from "../types.ds";
import { Card } from "./card";
import { Dealer } from "./dealer";
import { Player } from "./player";

class Table {
  players: Player[] = [];
  dealer: Dealer | null = null;
  currentPlayerIndex: number | null = null;
  deck: Card[] = [];
  currentBetBtnValue: number = 2;

  constructor() {
    makeObservable(this, {
      players: observable,
      dealer: observable,
      currentPlayerIndex: observable,
      deck: observable,
      currentBetBtnValue: observable,
      currentPlayer: computed,
      roundIsStarted: computed,
      ableToStartGame: computed,
      addPlayer: action,
      deal: action,
      hit: action,
      stand: action,
      double: action,
      draw: action,
      createDeck: action,
      shuffleDeck: action,
      playerRemove: action,
    });
  }
  get ableToStartGame(): boolean {
    return this.players.length > 0 && !this.dealer;
  }
  get roundIsStarted(): boolean {
    return this.players.length > 0 && !!this.dealer;
  }
  get currentPlayer(): Player | null {
    return typeof this.currentPlayerIndex === "number"
      ? this.players[this.currentPlayerIndex]
      : null;
  }

  setCurrentBetBtnValue(value: number): void {
    this.currentBetBtnValue = value;
  }

  addPlayer(seatId: string): void {
    // функция для добавления нового игрока в массив players
    if (!this.players.find((player) => player.seatId === seatId))
      this.players.push(new Player(seatId));
  }

  deal(dealerId: string): void {
    // функция для начала игры - раздачи карт всем игрокам и дилеру
    //происходит после нажатия кнопки начала игры
    this.dealer = new Dealer(dealerId);
    this.createDeck();
    this.shuffleDeck();
    this.players.forEach((player) => {
      player.hand = [this.draw(), this.draw()];
    });
    this.dealer.hand = [this.draw()];

    this.currentPlayerIndex = 0;
  }

  hit(): void {
    // функция для взятия карты текущим игроком
    this.currentPlayer!.hand.push(this.draw());
  }

  stand(): void {
    // функция для завершения хода текущего игрока
    this.currentPlayerIndex!++;
    if (this.dealer && this.currentPlayerIndex! === this.players.length) {
      this.currentPlayerIndex = null;
      while (this.dealer.canHit) this.dealer.hand.push(this.draw());
    }
  }

  double(): void {
    const bets = this.currentPlayer!.currentBet;
    this.currentPlayer!.currentBet = bets.concat(bets);
  }

  draw(): Card {
    // функция для извлечения карты из колоды
    return this.deck.shift() as Card;
  }

  createDeck(): void {
    // функция для создания колоды
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

  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  playerRemove(playerForRemoving: Player): void {
    const index = this.players.indexOf(playerForRemoving);
    index >= 0 && this.players.splice(index, 1);
  }
}

export default new Table();
