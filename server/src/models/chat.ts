import { IMessage } from '../types.ds';

import { getFormattedDate } from './utils/getFormattedDate';

export class Chat {
  public messages: IMessage[] = [];

  public addMessage = (message: IMessage): IMessage => {
    const newMessage = {...message};
    newMessage.time = getFormattedDate();

    this.messages.push(newMessage);
    return newMessage;
  };
}
