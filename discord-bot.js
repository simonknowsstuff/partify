// Import require
import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { io } from 'socket.io-client';

function grab_spotify_activity(presence) {
    let activity_obj = { // Model object being sent.
        "username": "",
        "avatar_url": "",
        "discriminator": "",
        "user_id": "",
        "banner": "",
        "song_name": "",
        "song_artist": "",
        "youtube_link": ""
    };
    if (presence != null) {
        if (presence.activities != []) {
            let spot_activity = presence.activities.find(currentValue => currentValue.name == "Spotify");
            if (spot_activity != undefined) {
                activity_obj.username = presence.user.username;
                activity_obj.avatar_url = presence.user.avatarURL();
                activity_obj.discriminator = presence.user.discriminator;
                activity_obj.user_id = presence.user.id;
                activity_obj.banner = presence.user.banner;
                activity_obj.song_name = spot_activity.details;
                activity_obj.song_artist = spot_activity.state;
            };
        }
    }
    return activity_obj;
}

export class DiscordBot {
    constructor(token, server_id, server_hostname, server_port) {
        this.token = token;
        this.server_id = server_id;
        this.server_hostname = server_hostname;
        this.server_port = server_port;
    }

    async run() {
        const socket = io("ws://" + this.server_hostname +":" + this.server_port);
        const { Client, Intents } = require('discord.js');
        const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });
        
        let current_listeners = [];

        client.on('ready', async () => {
            console.log(client.user.username + " booted up!")
            // Contact server from discord bot. Fetch member list.
            let server = await client.guilds.fetch(this.server_id);
            let member_list = await server.members.fetch({withPresences: true}); 
            member_list.forEach(member => {
                let spotify_activity = grab_spotify_activity(member.presence);
                if (spotify_activity.user_id != "") { // Check if invalid.
                    current_listeners.push(spotify_activity);
                }
            });

            socket.emit("bot_presence_data", current_listeners);
        });
        
        client.on('presenceUpdate', (oldPresence, newPresence) => {
            if (!oldPresence) {
                return;
            }
            let user_index = current_listeners.findIndex(function (currentValue) {
                if (currentValue.user_id === oldPresence?.userId) {
                    return true;
                }
            });
            if (user_index != -1) { // The user exists.
                let filtered_presence = grab_spotify_activity(newPresence);
                if (!filtered_presence.user_id) { // The user exists, but stopped playing the song.
                    current_listeners.splice(user_index, 1);
                    socket.emit("bot_presence_data", current_listeners);
                    return;
                }
                current_listeners[user_index] = grab_spotify_activity(newPresence); // The user exists, and the activity is updated.
                socket.emit("bot_presence_data", current_listeners);
                return;
            }
            // The user doesn't exist, and is playing a song.
            let filtered_presence = grab_spotify_activity(newPresence);
            if (filtered_presence.user_id != "") {
                current_listeners.push(filtered_presence);
            }
            socket.emit("bot_presence_data", current_listeners);
            return;
        });
        // Initialise Bot
        client.login(this.token);
    }
}



