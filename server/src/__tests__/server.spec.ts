/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { Server } from 'http';
import { ServerSocket } from '../serverSocket';
import { app } from '../server';

describe('Server tests', () => {
  let server: Server;
  let socket: ServerSocket;

  beforeAll(() => {
    server = new Server(app);
    socket = new ServerSocket(server);
  });

  afterAll(() => {
    server.close();
  });

  describe('GET /ping', () => {
    it('should return status code 200 and message "Server is running"', async () => {
      const response = await request(app).get('/ping');
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Server is running');
    });
  });

  describe('GET /', () => {
    it('should return status code 200 and an array of tables', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(socket.tables);
    });
  });

  describe('Invalid endpoint', () => {
    it('should return status code 404 and an error message', async () => {
      const response = await request(app).get('/invalid');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Not found!');
    });
  });
});
