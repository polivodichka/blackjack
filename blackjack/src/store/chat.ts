import { IMessage } from '../types.ds';

import { action } from 'mobx';
import { formatDate } from '../utils/formatDate';
import { makeObservable } from 'mobx';
import { observable } from 'mobx';

export class Chat {
  @observable public messages: IMessage[] = [];

  public constructor() {
    makeObservable(this);
  }

  @action.bound public addMessage = (message: IMessage): void => {
    message.time = formatDate(message.time);
    this.messages.push(message);
  };
}
