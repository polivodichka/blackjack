import { v4 } from 'uuid';

import { PlayerType } from '../types.ds';
import { User } from './abstractUser';
import { TBet } from '../types.ds';

export class Player extends User {
  public betChips: TBet[] = [];
  public insuranceBet: number | null = null;
  public parentAfterSplitPlayer: Player | null = null;
  public parentPlayer: Player | null = null;
  public roundIsEnded = false;
  public doubled = false;

  public constructor(
    private _name: string,
    tableId: string,
    public readonly id: string = v4(),
    spotId: string | null = null,
    private _balance: number = 100
  ) {
    super(tableId);
    this._name = _name;
    this.spotId = spotId;
    this.id = id;
    this._balance = _balance;
  }

  public get playerType(): PlayerType {
    if (this.parentPlayer) {
      return PlayerType.Player;
    }
    if (this.parentAfterSplitPlayer) {
      return PlayerType.Subplayer;
    }
    return PlayerType.Parent;
  }

  public get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
  }

  public get betChipsTotal(): number {
    return this.betChips.length
      ? (this.betChips as number[]).reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }

  public get balance(): number {
    if (this.playerType !== PlayerType.Parent && this.parentPlayer) {
      return this.parentPlayer._balance;
    } else {
      return this._balance;
    }
  }

  private set balance(amount: number) {
    this._balance = amount;
  }

  public get name(): string {
    return (
      this._name.charAt(0).toUpperCase() + this._name.slice(1).toLowerCase()
    );
  }

  private set name(value: string) {
    this._name = value;
  }

  public increaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.Parent && this.parentPlayer) {
      this.parentPlayer._balance = +this.parentPlayer._balance + amount;
    } else {
      this._balance = +this._balance + amount;
    }
  }

  public decreaseBalance(amount: number): void {
    if (this.playerType !== PlayerType.Parent && this.parentPlayer) {
      this.parentPlayer._balance = +this.parentPlayer._balance - amount;
    } else {
      this._balance = +this._balance - amount;
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
}
