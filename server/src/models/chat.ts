import { v4 } from 'uuid';

import { IMessage } from '../types.ds';

export class Chat {
  public messages: IMessage[] = [];

  public addMessage = (message: IMessage): IMessage => {
    const newMessage = { ...message };
    newMessage.id = v4();
    newMessage.time = new Date().toISOString();

    this.messages.push(newMessage);
    return newMessage;
  };
}
