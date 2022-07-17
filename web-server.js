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
    
    let listeners_data = [];

    async function alter_listeners(spot_arr) {
      for (let spot_obj of spot_arr) {
        if (spot_obj) {
          let query = spot_obj.song_name + " - " + spot_obj.song_artist
          let yt_search = await youtube.search(query, {type: 'video'});
          spot_obj.youtube_link = yt_search.videos[0].link;
        }
      }
      return spot_arr;
    }

    // socket.io
    const io = new Server(server);

    app.use('/public', express.static('public'));
    app.get('/', (req, res) => {
      res.sendFile(WEB_DIR + '/index.html');
    });

    server.listen(this.port, () => {
      console.log('server started on port ' + this.port);
    });

    io.on("connection", (socket) => {
      if (listeners_data.length > 0) {
        io.emit("listeners_data_emit", listeners_data);
      }

      socket.on("bot_presence_data", async (spot_arr) => {
        if (spot_arr) {
          listeners_data = await alter_listeners(spot_arr);
          io.emit("listeners_data_emit", listeners_data);
        }
      });
    });
  }
}