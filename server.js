require('dotenv').config();
const express = require('express');
const http = require('http');
const ws = require('ws');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const serializeGames = require('./serialization').serializeGames;
const serializeAllCards = require('./serialization').serializeAllCards
const sendRefreshPlayersList = require('./socketMessages').sendRefreshPlayersList;

const httpPort = process.env.PORT;
const host = process.env.HOST || 'localhost';
const url = process.env.URL || `http://${host}:${httpPort}`;

const app = express();
const server = http.createServer(app);
const wsServer = new ws.Server({ server });

app.use(cors());
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'public')));

// class for holding player data
class Player {
  constructor() {
    this.userName = '';
    this.cards = [];
    this.webSocket = null;
    this.currentCards = [];
    this.numberOfCards = 1;
  }
}

// class for holding game data
class Game {
  constructor() {
    this.players = {};
    this.playerIdSequence = 1;
    this.creatorUserName = '';
  }
}
 
// id for the game
let gameIdSequence = 1;

// list for holding games, Redis in future
const games = {};

app.get('/', (req, res) => {
  console.log('GET /');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function createGame(socket, userName) {
  if (userName === '' || userName === null) {
    const data = {
      event: 'error',
      message: 'Please provide a username',
      errorCode: 1,
    };
    socket.send(JSON.stringify(data));
    return;
  }

  // create game
  const game = new Game();
  const id = gameIdSequence;
  game.creatorUserName = userName;
  games[id] = game;
  gameIdSequence += 1;

  // create player
  const player = new Player();
  player.webSocket = socket;
  game.players[game.playerIdSequence] = player;
  game.playerIdSequence += 1;
  
  // send a message to the client
  let data = {
    event: 'gameCreated',
    gameId: id,
  };
  socket.send(JSON.stringify(data));
}

// websocket connection
wsServer.on('connection', (socket) => {
  // print to the console when a new player connects
  console.log('New player connected');

  socket.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.event === 'createGame') {
      createGame(socket, data.userName);
    } else if (data.event === 'joinGame') {
      joinGame(data.gameId, socket, data.userName);
    } else if (data.event === 'abandonGame') {
      abandonGame(data.gameId, socket);
    } else if (data.event === 'newRound') {
      newRound(data.gameId);
    } else if (data.event === 'giveCard') {
      giveCard(data.gameId, data.playerId);
    } else if (data.event === 'showAll') {
      showAll(data.gameId);
    }
  });

  socket.on('close', () => {
    console.log('Player disconnected');
    // find the game that the player is in and remove the player from the game
    for (const gameId in games) {
      const game = games[gameId];
      for (const playerId in game.players) {
        if (game.players[playerId].webSocket === socket) {
          delete game.players[playerId];
          if (Object.keys(game.players).length == 0) {
            delete games[gameId];
          } else {
            sendRefreshPlayersList(game.players);
          }
          return;
        }
      }
    }
  });
});

function newRound(gameId) {
  const playersList = Object.values(games[gameId].players);

  // create a deck of cards and shuffle it
  const deck = Array.from({ length: 52 }, (_, i) => i);
  deck.sort(() => Math.random() - 0.5);

  playersList.forEach((player) => {
    player.currentCards = [];

    // give each player [player.numberOfCards] cards
    for (let i = 0; i < player.numberOfCards; i++) {
      player.currentCards.push(deck.pop());
    }

    const data = {
      event: 'newRound',
      cards: player.currentCards,
    };

    // send the data to the player
    player.webSocket.send(JSON.stringify(data));

  });
}

function joinGame(gameId, socket, userName) {
  if (!games[gameId]) {
    socket.send('Game not found');
    return;
  }

  console.log("UserName:", userName);

  const player = new Player();
  player.webSocket = socket;
  player.userName = userName;

  const game = games[gameId];

  // join the game
  game.players[game.playerIdSequence] = player;
  game.playerIdSequence += 1;

  let data = {
    event: 'gameJoined',
    gameId: gameId,
  };

  // send a message to the client
  socket.send(JSON.stringify(data));

  // send the updated list of games to all players
  sendRefreshPlayersList(game.players);
}

function giveCard(gameId, playerId) {
  games[gameId].players[playerId].numberOfCards += 1;
  sendRefreshPlayersList(games[gameId].players);
}

function abandonGame(gameId, socket) {
  games[gameId].players = games[gameId].players.filter((player) => player.webSocket !== socket);

  if (games[gameId].players.length === 0) {
    delete games[gameId];
  } else {
    sendRefreshPlayersList(games[gameId].players);
  }
}

function showAll(gameId) {
  const playersList = Object.values(games[gameId].players);
  const allCards = serializeAllCards(playersList);

  let data = {
    event: 'showAll',
    players: allCards,
  };

  playersList.forEach((player) => {
    player.webSocket.send(JSON.stringify(data));
  });
}

// endpoint /games
app.post('/games', (req, res) => {
  console.log(req.body);
  const userName = req.body.userName;
  const id = gameIdSequence;
  
  const game = new Game();
  game.creatorUserName = userName;
  games[id] = game;
  gameIdSequence += 1;
  res.send({ gameId: id });
});

// endpoint /games/{id}/join
app.post('/games/:id/join', (req, res) => {
  const id = req.params.id;
  const player = new Player();

  games[id].players.push(player);
  res.send('Successfully joined the game');
});

// endpoint /games
app.get('/games', (req, res) => {
  res.send(serializeGames(games));
});


server.listen(httpPort, host, () => {
  console.log(`Server running at ${url}`);
});