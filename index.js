import 'dotenv/config';
import { DiscordBot } from './discord-bot.js';
import { WebServer } from './web-server.js';

const bot = new DiscordBot(process.env.DISCORD_TOKEN, process.env.DISCORD_SERVER_ID, process.env.WEB_SERVER_HOSTNAME, process.env.WEB_SERVER_PORT);
const server = new WebServer(process.env.WEB_SERVER_PORT);

async function main() {
    await bot.run();
    await server.run();
}

await main();