import { nanoid } from "nanoid";

export class Seat {
  id: string = nanoid();
  playerId: string;
  bet: number[] = [];
  constructor(playerId: string, bet: number) {
    this.playerId = playerId;
    this.bet.push(bet);
  }

  set(playerId: string, bet: number[]) {
    this.playerId = playerId;
    this.bet = bet;
  }
}
