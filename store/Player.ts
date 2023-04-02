import { nanoid } from "nanoid";
import { ICard } from "../types.ds";
import { Seat } from "./Seat";

export class Player {
  id: string = nanoid();
  tableId: string = "";
  seatId: string = "";
  cards: ICard[] = [];
  bet: number[] = [];
  seats: Seat[] = [];

  setBet(bet: number) {
    this.bet.push(bet);
  }
}
