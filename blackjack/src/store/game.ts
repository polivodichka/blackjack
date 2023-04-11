import { action, autorun, computed, makeObservable, observable } from "mobx";

import { Player } from "./player";
import { Table } from "./table";

export class Game {
  @observable player: Player | null = null;
  @observable table: Table | null = null;

  constructor() {
    makeObservable(this);
    autorun(() => {
      this.table = new Table();
    });
  }
  @action.bound set(player: Player, table: Table) {
    this.player = player;
    this.table = table;
  }
  @action.bound startGame(tableId?: string) {
    if (!tableId) {
      this.table = new Table();
      this.player = this.table.addPlayer("");
      console.log(this.player, this.table);
    }
  }
  @computed get gameIsReady(): boolean {
    return !!(this.player && this.table);
  }
}

export default new Game();
