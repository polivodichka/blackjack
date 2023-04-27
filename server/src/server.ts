import express from 'express';
import http from 'http';

import { ServerSocket } from './serverSocket';

export const app = express();
//Server handling
export const httpServer = http.createServer(app);

//Start socket
const socket = new ServerSocket(httpServer);

app.get('/ping', (req, res, next) => {
  return res.status(200).json({ message: 'Server is running' });
});

app.get('/', (_, res) => {
  res.status(200).json(socket.tables);
});

app.use((_, res) => {
  const error = new Error('Not found!');

  res.status(404).json({ message: error.message });
});

//Listen
httpServer.listen(5000, () => console.info('Server is running on port 5000'));
