// Import require, __dirname
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
import { youtube } from 'scrape-youtube';

export class WebServer {
  constructor(port) {
    this.port = port;
  }

  async run() {
    const express = require('express');
    const app = express();
    const http = require('http');
    const server = http.createServer(app);
    const WEB_DIR = __dirname + "/assets/web"
    const { Server } = require("socket.io");
    

    // socket.io
    const io = new Server(server);

    app.get('/', (req, res) => {
      res.sendFile(WEB_DIR + '/index.html');
    });

    server.listen(this.port, () => {
      console.log('listening on *:3000');
    });

    io.on("connection", (socket) => {
      socket.on("bot_presence_data", (spot_arr) => {
        if (spot_arr) {
          spot_arr.forEach(spot_obj => {
            if (spot_obj.song_name) {
              let query = spot_obj.song_name + " - " + spot_obj.song_artist
              youtube.search(query, {type: 'video'}).then((results) => {
                spot_obj.youtube_link = results.videos[0].link
                console.log(spot_obj.username + " is listening to " + spot_obj.youtube_link);
              });
            }
          });
        }
        return;
      });
    });
  }
}