import http from "http";
import express from "express";
import { ServerSocket } from "./socket";

const app = express();

//Server handling
const httpServer = http.createServer(app);

//Start socket
export const socket = new ServerSocket(httpServer);

//Rules of API
app.use(function (req, res,) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
});

//Listen
httpServer.listen(5000, () => console.info("Server is running on port 5000"));
