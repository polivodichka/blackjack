import { PlayerGameState, PlayerType, TBet } from "../src/types.ds";
import { Dealer } from "./dealer";
import { v4 } from "uuid";
import { socket } from "../src/server";

export class Player extends Dealer {
  name: string;
  betChips: TBet[] = [];
  insuranceBet: number | null = null;
  parentAfterSplitPlayer: Player | null = null;
  parentPlayer: Player | null = null;
  roundIsEnded: boolean = false;

  readonly id: string;
  private _balance: number;

  constructor(
    name: string,
    tableId: string,
    id: string = v4(),
    spotId: string = "",
    _balance?: number
  ) {
    super(tableId);
    this.name = name;
    this.spotId = spotId;
    this.id = id;
    this._balance = _balance ?? 100;
  }

  get playerType(): PlayerType {
    if (this.parentPlayer) return PlayerType.player;
    if (this.parentAfterSplitPlayer) return PlayerType.subplayer;
    return PlayerType.parent;
  }

  get isSplitted(): boolean {
    return (
      this.isSubplayer ||
      (socket.tables[this.tableId].spots[this.spotId].length ?? 1) > 1
    );
  }

  get isSubplayer(): boolean {
    return !!this.parentAfterSplitPlayer;
  }

  get betChipsTotal() {
    return this.betChips.length
      ? (this.betChips as number[]).reduce((bet1, bet2) => bet1 + bet2)
      : 0;
  }
  get balance(): number {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      return this.parentPlayer._balance;
    else return this._balance;
  }
  increaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance += amount;
    else this._balance += amount;
  }
  decreaseBalance(amount: number) {
    if (this.playerType !== PlayerType.parent && this.parentPlayer)
      this.parentPlayer._balance -= amount;
    else this._balance -= amount;
  }
  bet(amount: TBet): void {
    if (amount <= this.balance) {
      this.betChips.push(amount);
      this.decreaseBalance(amount);
    }
  }
  insurance(amount = this.betChipsTotal / 2): void {
    if (amount <= this.balance) {
      this.insuranceBet = amount;
      this.decreaseBalance(amount);
    }
  }
  betDeleteByIndex(index: number): void {
    this.increaseBalance(this.betChips[index]);
    this.betChips.splice(index, 1);
    if (this.betChips.length < 1)
      socket.tables[this.tableId].playerRemove(this);
  }
  get state(): PlayerGameState {
    if (this.handTotal > 21) return PlayerGameState.Bust;
    if (this.handTotal === 21 && !this.roundIsStarted && !this.isSplitted)
      return PlayerGameState.NaturalBlackjack;
    if (this.handTotal === 21) return PlayerGameState.Blackjack;
    if (this.handTotal < 21 && this.handTotal > 0)
      return PlayerGameState.Active;
    return PlayerGameState.Error;
  }
  reset(): void {
    if (this.betChipsTotal > this.balance) {
      this.betChips = [];
    } else this.decreaseBalance(this.betChipsTotal);
    this.hand = [];
    this.insuranceBet = 0;

    const table = socket.tables[this.tableId];
    table.removeFakePlayers(this.parentPlayer ?? this);

    socket.tables[this.tableId].dealer = null;
    this.parentPlayer!.roundIsEnded = true;
  }
}
