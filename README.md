# Partify
![Partify Logo](./public/images/logo.svg)

Partify is a nodejs app used for listening songs others are listening to!

Partify uses [discord.js](https://discord.js.org/) and [Express](http://expressjs.com/) to run a discord bot to check the rich presence status of users in a given server and report their status to a local webserver which displays the songs each users are listening to. The songs are played through a YouTube embed with the help of the [scrape-youtube](https://www.npmjs.com/package/scrape-youtube) library.

## Installation

Install the package manager [npm](https://www.npmjs.com/package/npm) and the runtime environment [Node.js](https://nodejs.org/en/) to run Partify.

## Usage
Install the required dependencies by:
```javascript
npm install
```
Create a `.env` file with the following info:
```
DISCORD_TOKEN=YOUR_TOKEN
DISCORD_SERVER_ID=`YOUR_SERVER_ID`
WEB_SERVER_PORT=`YOUR_SERVER_PORT`
WEB_SERVER_HOSTNAME=`YOUR_HOSTNAME`
```
To run the program locally, set the hostname to `localhost`.

Run the program through node by:
```javascript
node .
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)