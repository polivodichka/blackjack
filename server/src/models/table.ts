import { Card } from './card';
import { Dealer } from './dealer';
import { Player } from './player';
import { PlayerGameState } from '../types.ds';
import { PlayerType } from '../types.ds';
import { Rank } from '../types.ds';
import { Suit } from '../types.ds';

import { v4 } from 'uuid';

export class Table {
  public readonly id: string = v4();
  public allPlayers: Player[] = [];
  public dealer: Dealer | null = null;
  public currentPlayerIndex: number | null = null;
  public deck: Card[] = [];
  public roundIsStarted = false;

  public get players(): Player[] {
    return this.allPlayers.filter(
      (player) => player.playerType !== PlayerType.parent
    );
  }

  public get playingPlayers(): Player[] {
    return this.allPlayers.filter((player) => !!player.hand.length);
  }

  private get handsEmpty(): boolean {
    return this.players.every((player) => player.hand.length === 0);
  }

  public get currentPlayer(): Player | null {
    return typeof this.currentPlayerIndex === 'number'
      ? this.players[this.currentPlayerIndex]
      : null;
  }

  public get spots(): Record<string, Player[]> {
    return this.players.reduce<Record<string, Player[]>>((result, player) => {
      if (player.spotId && !result[player.spotId]) {
        result[player.spotId] = [];
      }
      if (player.spotId) {
        result[player.spotId].push(player);
      }
      return result;
    }, {});
  }

  public addPlayer(
    name: string,
    spotId: string,
    balance: number,
    id: string = v4(),
    parentPlayerId?: string
  ): Player {
    const player = this.players.find(
      (findedPlayer) => findedPlayer.spotId === spotId
    );
    if (!player) {
      const newPlayer = new Player(name, this.id, id, spotId, balance);
      const parentPlayer = this.allPlayers.find(
        (findedPlayer) => findedPlayer.id === parentPlayerId
      );
      newPlayer.parentPlayer = parentPlayer ?? null;
      this.allPlayers.push(newPlayer);
      return newPlayer;
    }
    return player;
  }

  public playerRemove(player: Player): void {
    this.removeFakePlayers(player);
    const index = this.allPlayers.indexOf(player);
    if (index >= 0) {
      this.allPlayers.splice(index, 1);
    }
    if (this.handsEmpty) {
      this.dealer = null;
    }
  }

  public removeFakePlayers(parent: Player): void {
    this.players
      .filter(
        (player) =>
          player.parentPlayer?.id === parent.id ||
          player.parentAfterSplitPlayer?.id === parent.id
      )
      .map((player) => {
        this.playerRemove(player);
      });
    parent.roundIsEnded = false;
  }

  public rebet(parent: Player): void {
    this.players
      .filter(
        (player) =>
          player.parentPlayer?.id === parent.id && player.parentAfterSplitPlayer
      )
      .map((player) => {
        this.playerRemove(player);
      });
    const playersWithBet = this.players.filter(
      (player) =>
        player.parentPlayer?.id === parent.id && !player.parentAfterSplitPlayer
    );
    playersWithBet.map((player) => {
      player.hand = [];
      player.insuranceBet = null;
    });
    parent.balance -= parent.betChipsTotalWithChildren;
    parent.roundIsEnded = false;
    if (this.handsEmpty) {
      this.dealer = null;
    }
  }

  public deal(): void {
    this.roundIsStarted = true;
    this.dealer = new Dealer(this.id);
    this.createDeck();
    this.shuffleDeck();
    this.players.forEach((player) => {
      player.hand = [this.draw(), this.draw()];
    });
    this.dealer.hand = [this.draw()];

    this.currentPlayerIndex = 0;
  }

  public hit(): void {
    if (this.currentPlayer?.hand) {
      this.currentPlayer.hand.push(this.draw());
    }
  }

  public stand(): void {
    if (this.currentPlayerIndex !== null) {
      this.currentPlayerIndex++;
    }
  }

  public split(): void {
    const player = this.currentPlayer;
    if (player && this.currentPlayerIndex !== null) {
      if (player.betChipsTotal <= player.balance) {
        const subPlayer = new Player('', this.id, undefined, player.spotId, 0);
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
        if (index >= 0) {
          this.allPlayers.splice(index, 0, subPlayer);
        }
      }
    }
  }

  public double(): void {
    const player = this.currentPlayer;
    if (player && player.betChipsTotal <= player.balance) {
      player.decreaseBalance(player.betChipsTotal);
      player.betChips = player.betChips.concat(player.betChips);
      this.hit();
      this.stand();
    }
  }

  public draw(): Card {
    return this.deck.shift() as Card;
  }

  public countWinnings(): void {
    this.players.forEach((player) => {
      const betSum = player.betChipsTotal;
      const insurance = player.insuranceBet ?? 0;
      if (this.dealer) {
        //insurance
        if (this.dealer.isNaturalBJ) {
          player.increaseBalance(insurance * 2);
        }

        switch (player.state) {
          case PlayerGameState.NaturalBlackjack:
            player.increaseBalance(betSum * 2.5);
            break;

          case PlayerGameState.Blackjack:
            if (this.dealer.isBJ || this.dealer.isNaturalBJ) {
              player.increaseBalance(betSum);
            } else {
              player.increaseBalance(betSum * 2);
            }
            break;

          case PlayerGameState.Active:
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
      if (player.parentPlayer) {
        player.parentPlayer.roundIsEnded = true;
      }
    });
  }

  private createDeck(): void {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = [
      { rank: Rank.ace, value: 11 },
      { rank: Rank._2, value: 2 },
      { rank: Rank._3, value: 3 },
      { rank: Rank._4, value: 4 },
      { rank: Rank._5, value: 5 },
      { rank: Rank._6, value: 6 },
      { rank: Rank._7, value: 7 },
      { rank: Rank._8, value: 8 },
      { rank: Rank._9, value: 9 },
      { rank: Rank._10, value: 10 },
      { rank: Rank.jack, value: 10 },
      { rank: Rank.queen, value: 10 },
      { rank: Rank.king, value: 10 },
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

  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
}
