// import { makeAutoObservable } from "mobx";
// import { nanoid } from "nanoid";
// import { ICard, IPlayer } from "../types.ds";
// import { Dealer } from "./Dealer";
// import { Player } from "./Player";
// import { Seat } from "./Seat";

// export class Table {
//   id: string = nanoid();
//   players: Player[] = [];
//   //игроки с сервера
//   currentPlayer: Player = new Player();
//   //диллер должен быть с сервера
//   dealer: Dealer = new Dealer();
//   deck: ICard[] = [];
//   //места
//   seats: Seat[] = [new Seat(), new Seat(), new Seat(), new Seat(), new Seat()];
//   activatedBetValue: number = 2;
//   bettingRound: boolean = false;
//   gameRound: boolean = false;

//   constructor() {
//     makeAutoObservable(this, {}, { autoBind: true });
//   }

//   //по входу в игру
//   setPlayers(player: Player, seatId: string) {
//     //получить игроков с сервера
//     this.players.push(this.currentPlayer);
//   }
// }
