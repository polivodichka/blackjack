import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { Blob, ChatWrapper, MessageForm, MessagesWrapper } from './Chat.styled';
import { IMessage, SocketEmit, SocketOn, SoundType } from '../../../types.ds';
import { Color } from '../../../constants/constants';
import { StyledBtn } from '../../App/App.styled';
import { socket } from '../../../server/socket';
import { game } from '../../../store/game';

export const Chat: React.FC = observer(() => {
  const messages = game.chat?.messages ?? [];
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length) {
      const newMessage: IMessage = {
        id: '',
        text: inputValue.split('\n'),
        playerId: game.player?.id ?? '',
        playerName: game.player?.name ?? '',
        time: '',
      };

      game.emit[SocketEmit.ChatSendMessage](JSON.stringify(newMessage));
      game.playSound(SoundType.Click);
      setInputValue('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    socket.on(SocketOn.ChatServerMessage, () => {
      setInputValue('');
    });
  }, [messages.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };
  const handleKeyPressed = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { code, shiftKey } = e;
    const { value } = e.target as HTMLTextAreaElement;

    if (shiftKey && code === 'Enter') {
      // Shift + Enter
      e.preventDefault();
      setInputValue(`${value}\n`);
    } else if (code === 'Enter') {
      // Enter
      handleSubmit(e);
    } else {
      setInputValue(value);
    }
  };

  return (
    <ChatWrapper>
      <MessagesWrapper onClick={(e) => e.stopPropagation()}>
        {messages.map((message) => (
          <Blob
            key={message.id}
            className={message.playerId === game.player?.id ? 'myMessage' : ''}
          >
            <div className="playerName">{message.playerName}</div>
            <div className="text">
              {message.text.map((line, i) => (
                <p key={`${message.id}-line${i}`}>{line}</p>
              ))}
            </div>
            <div className="time">{message.time}</div>
          </Blob>
        ))}
        <div ref={messagesEndRef} />
      </MessagesWrapper>
      <MessageForm
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="message-form"
      >
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPressed}
          placeholder="Shift+Enter for new line&#10;Enter for send"
        />
        <StyledBtn
          type="submit"
          disabled={!inputValue.length}
          style={{ background: Color.MainSemitransparent }}
        >
          Send
        </StyledBtn>
      </MessageForm>
    </ChatWrapper>
  );
});
