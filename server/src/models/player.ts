import { Dealer } from './dealer';
import { PlayerGameState } from '../types.ds';
import { PlayerType } from '../types.ds';
import { Table } from './table';
import { TBet } from '../types.ds';

import { socket } from '../server';
import { v4 } from 'uuid';

export class Player extends Dealer {
  public name: string;
  public betChips: TBet[] = [];
  public insuranceBet: number | null = null;
  public parentAfterSplitPlayer: Player | null = null;
  public parentPlayer: Player | null = null;
  public roundIsEnded = false;

  public readonly id: string;
  private _balance: number;

  public constructor(
    name: string,
    tableId: string,
    id: string = v4(),
    spotId: string | null = null,
    _balance?: number
  ) {
    super(tableId);
    this.name = name;
    this.spotId = spotId;
    this.id = id;
    this._balance = _balance ?? 100;
  }

  public get playerType(): PlayerType {
    if (this.parentPlayer) {
      return PlayerType.player;
    }
    if (this.parentAfterSplitPlayer) {
      return PlayerType.subplayer;
    }
    return PlayerType.parent;
  }

  private get table(): Table {
    return socket.tables[this.tableId];
  }

  private get spot(): Player[] | null {
    return this.spotId ? this.table.spots[this.spotId] : null;
  }

  private get isSplitted(): boolean {
    return this.isSubplayer || (this.spot?.length ?? 1) > 1;
  }

  private get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
  }

  public get betChipsTotal(): number {
    return this.betChips.length
      ? (this.betChips as number[]).reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  public get betChipsTotalWithChildren(): number {
    const players = this.table.allPlayers.filter(
      (player) =>
        player.id === this.id ||
        player.parentAfterSplitPlayer?.id === this.id ||
        player.parentPlayer?.id === this.id
    );
    const chips = players
      .map((player) => player.betChips)
      .reduce((a, b) => a.concat(b));
    return chips.length
      ? (chips as number[]).reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  public get balance(): number {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
    {return this.parentPlayer._balance;}
    else {return this._balance;}
  }

  public set balance(amount: number) {
    this._balance = amount;
  }

  public increaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.parent && this.parentPlayer) {
      this.parentPlayer._balance += amount;
    } else {
      this._balance += amount;
    }
  }

  public decreaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.parent && this.parentPlayer) {
      this.parentPlayer._balance -= amount;
    } else {
      this._balance -= amount;
    }
  }

  public bet(amount: TBet): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.decreaseBalance(amount);
    }
  }

  public insurance(amount = this.betChipsTotal / 2): void {
    if (amount <= this.balance) {
      this.insuranceBet = amount;
      this.decreaseBalance(amount);
    }
  }

  public betDeleteByIndex(index: number): void {
    this.increaseBalance(this.betChips[index]);
    this.betChips.splice(index, 1);
    if (this.betChips.length < 1) {
      this.table.playerRemove(this);
    }
  }

  public get state(): PlayerGameState {
    if (this.handTotal > 21) {
      return PlayerGameState.Bust;
    }
    if (this.handTotal === 21 && !this.roundIsStarted && !this.isSplitted) {
      return PlayerGameState.NaturalBlackjack;
    }
    if (this.handTotal === 21) {
      return PlayerGameState.Blackjack;
    }
    if (this.handTotal < 21 && this.handTotal > 0) {
      return PlayerGameState.Active;
    }
    return PlayerGameState.Error;
  }
}
