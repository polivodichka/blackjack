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
      seats: computed,
      needInsurance: computed,
      addPlayer: action,
      deal: action,
      hit: action,
      stand: action,
      split: action,
      double: action,
      draw: action,
      createDeck: action,
      shuffleDeck: action,
      playerRemove: action,
    });

    autorun(() => {
      if (this.dealer && this.currentPlayerIndex! === this.players.length) {
        this.currentPlayerIndex = null;
        while (this.dealer.canHit) this.dealer.hand.push(this.draw());
      }
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
  get seats(): {
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
  get needInsurance(): boolean {
    return !!!(
      this.dealer && this.dealer.hand.find((card) => card.rank === "ace")
    );
  }

  setCurrentBetBtnValue(value: number): void {
    this.currentBetBtnValue = value;
  }

  addPlayer(seatId: string): Player {
    // функция для добавления нового игрока в массив players
    const player = this.players.find((player) => player.seatId === seatId);
    if (!player) {
      const newPlayer = new Player(seatId);
      this.players.push(newPlayer);
      return newPlayer;
    }
    return player;
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
  }

  split() {
    if (this.currentPlayer && this.currentPlayerIndex !== null) {
      const subPlayer = new Player(this.currentPlayer.seatId);
      subPlayer.parentPlayer = this.currentPlayer;
      subPlayer.hand = this.currentPlayer.hand.splice(1, 1);
      subPlayer.currentBet = [...this.currentPlayer.currentBet];

      this.currentPlayer.hand.push(this.draw());
      subPlayer.hand.push(this.draw());

      this.players.splice(this.currentPlayerIndex, 0, subPlayer);
    }
  }

  double(): void {
    const player = this.currentPlayer;
    if (player) {
      const bets = player.currentBet;
      player.currentBet = bets.concat(bets);
      this.hit();
      this.stand();
    }
  }

  insurance(): void {
    this.currentPlayer &&
      this.currentPlayer.insuarence.push(
        this.currentPlayer?.currentBet.reduce((a, b) => a + b) / 2
      );
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
