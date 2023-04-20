/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { MySocket } from '../socket.ds';
import { SocketEmit } from '../types.ds';
import { SocketEventNamesEmit } from '../socket.ds';
import { SocketEventNamesOn } from '../socket.ds';
import { SocketEventsEmit } from '../socket.ds';
import { SocketEventsOn } from '../socket.ds';
import { SocketOn } from '../types.ds';
import MockedSocket from 'socket.io-mock'


describe('Socket tests', () => {
  let socket: MySocket;

  beforeEach(() => {
    // create a mock socket instance
    socket = new MockedSocket();
    socket.emit = jest.fn();
    socket.on = jest.fn();
    socket.broadcast.to = jest.fn().mockReturnValue({
      emit: jest.fn(),
    });
  });

  describe('emit', () => {
    it('should call socket.emit with the given event name and arguments', () => {
      const eventName: SocketEventNamesEmit = SocketEmit.TableCreated;
      const args: Parameters<SocketEventsEmit[typeof eventName]> = [
        'table',
        'player',
        'chat',
      ];

      socket.emit(eventName, ...args);

      expect(socket.emit).toHaveBeenCalledWith(eventName, ...args);
    });
  });

  describe('on', () => {
    it('should call socket.on with the given event name and listener', () => {
      const eventName: SocketEventNamesOn = SocketOn.JoinTable;
      const listener: SocketEventsOn[typeof eventName] = jest.fn();

      socket.on(eventName, listener);

      expect(socket.on).toHaveBeenCalledWith(eventName, listener);
    });
  });

  describe('broadcast.to.emit', () => {
    it('should call socket.broadcast.to.emit with the given event name and arguments', () => {
      const eventName: SocketEventNamesEmit = SocketEmit.TableCreated;
      const args: Parameters<SocketEventsEmit[typeof eventName]> = [
        'table',
        'player',
        'chat',
      ];
      const room = 'room1';

      socket.broadcast.to(room).emit(eventName, ...args);

      expect(socket.broadcast.to(room).emit).toHaveBeenCalledWith(
        eventName,
        ...args
      );
    });
  });
  
});
