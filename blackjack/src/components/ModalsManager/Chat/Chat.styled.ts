import styled from 'styled-components';

import { Color } from '../../../constants/constants';

export const ChatWrapper = styled.div`
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100%;
  width: 60%;
  padding: 20px;
`;

export const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: scroll;
  margin-right: 20px;

  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: ${Color.Main} ${Color.MainDark};

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: ${Color.MainDark};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${Color.Main};
    border-radius: 20px;
    border: 3px solid ${Color.MainDark};
  }

  /* ползунок прокрутки при наведении на него курсора */
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${Color.MainAccent};
  }
`;

export const Blob = styled.div`
  background: rgba(255, 255, 255, 0.9);
  width: 60%;
  align-self: flex-start;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-weight: 700;

  &.myMessage {
    background: rgba(20, 30, 48, 0.9);
    align-self: flex-end;
    color: #fff;
  }

  .playerName {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .text {
    font-weight: 100;
    font-size: 14px;
    margin-bottom: 5px;
    p {
      margin: 0;
    }
  }

  .time {
    font-size: 12px;
    color: gray;
    text-align: right;
  }
`;

export const MessageForm = styled.form`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: auto;

  textarea {
    padding: 10px;
    border-radius: 5px;
    border: none;
    outline: none;
    margin-right: 10px;
    flex-grow: 1;
    resize: none;
    font-size: 18px;
    font-weight: 100;
    height: 70px;
    transition: height 0.3s ease-in-out;

    &:focus {
      height: 100px;
    }
  }
`;
