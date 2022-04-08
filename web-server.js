// Import require, __dirname
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const WEB_DIR = __dirname + "/assets/web"

// socket.io
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(WEB_DIR + '/index.html');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on("connection", (socket) => {
  socket.on("bot_presence_data", (arg) => {
    console.log(arg);
  });
});