import { Dealer } from "./Dealer";
import { Player } from "./Player";

export const ServerDealer = new Dealer();

export const players = [new Player(), new Player()]



/**
 * На сервере
 * tables[]
 * table: {
 *  players: [];
 *  dealer:[];
 *  orderPlayer: Player;
 *  deck: [];
 *  gameStatus: "bet/round"
 * }
 */