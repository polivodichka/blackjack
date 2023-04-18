import { makeObservable } from 'mobx';
import { observable } from 'mobx';
import { action } from 'mobx';

import { IMessage } from '../types.ds';

export class Chat {
  @observable public messages: IMessage[] = [];

  public constructor() {
    makeObservable(this);
  }

  @action.bound public addMessage = (message: IMessage): void => {
    this.messages.push(message);
  };
}
