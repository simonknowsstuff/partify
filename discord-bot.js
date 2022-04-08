// Import require
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Import Discord and env config file.
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });
require('dotenv').config(); 

import { io } from 'socket.io-client';
const socket = io("ws://localhost:3000");

let current_listeners = [];

function grab_spotify_activity(presence) {
    let activity_obj = { // Custom Spotify Object.
        "username": "",
        "discriminator": "",
        "user_id": "",
        "song_name": "",
        "song_artist": "",
        "session_id": ""
    };
    if (presence != null) {
        if (presence.activities != []) {
            let spot_activity = presence.activities.find(currentValue => currentValue.name == "Spotify");
            if (spot_activity != undefined) {
                activity_obj.username = presence.user.username;
                activity_obj.discriminator = presence.user.discriminator;
                activity_obj.user_id = presence.user.id;
                activity_obj.song_name = spot_activity.details;
                activity_obj.song_artist = spot_activity.state;
                activity_obj.session_id = spot_activity.sessionId;
            };
        }
    }
    return activity_obj;
}

client.on('ready', async () => {
    console.log(client.user.username + " booted up!")
    // Contact server from discord bot. Fetch member list.
    let server = await client.guilds.fetch(process.env.SERVER_ID);
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
client.login(process.env.DISCORD_TOKEN);
