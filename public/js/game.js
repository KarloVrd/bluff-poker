
const wsUrl = 'ws://localhost:5000';

const socket = new WebSocket(wsUrl);

const symbols = ['♠', '♣', '♥', '♦'];

function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const queryArray = queryString.split('&');
  queryArray.forEach(param => {
      const [key, value] = param.split('=');
      params[key] = decodeURIComponent(value);
  });
  return params;
}

function joinGame() {
  console.log('Joining game');
  socket.send(JSON.stringify({ event: 'joinGame', gameId: gameId , userName: userName }));
}

// Retrieve gameId from the URL query parameters
const queryParams = getQueryParams();
const gameId = queryParams.gameId;
const userName = queryParams.userName;

// Connect to the WebSocket server
connectWebSocket();

function newRound() {
    console.log('New round');
    socket.send(JSON.stringify({ event: 'newRound', gameId: gameId }));
}
function displayCards(cards) {
    const hand = document.getElementsByClassName('hand__cards')[0];
    hand.innerHTML = '';

    cards.forEach(card => {
        const cardElement = createCardDiv(card);
        hand.appendChild(cardElement);
    });
}

function createCardDiv(cardId){
    const cardDiv = document.createElement('div');
    const cardImg = document.createElement('img');

    cardImg.src = `/cards_images/${cardId}.png`;
    cardDiv.style.width = '100px';
    cardImg.style.width = '100px';
    cardImg.style.height = '150px';
    cardImg.style.margin = '10px';
    cardImg.style.cursor = 'pointer';
    // cardImg.style.border = '1px solid black';
    cardImg.style.transition = 'width 0.3s ease';

    cardDiv.style.display = 'flex';
    cardDiv.style.justifyContent = 'center';

    cardDiv.flipped = false;
    cardDiv.cardId = cardId;

    cardDiv.addEventListener('click', () => {
        flipCard(cardDiv);
    }
    );

    cardDiv.appendChild(cardImg);

    return cardDiv;
}

function flipCard(cardDiv) {
  const cardImg = cardDiv.children[0];
  if (cardDiv.flipped) {
    cardImg.style.width = '0px';
    setTimeout(() => {
        cardImg.src = `/cards_images/${cardDiv.cardId}.png`;
        cardImg.style.width = '100px';
      }, 300);
  } else {
      cardImg.style.width = '0px';
      setTimeout(() => {
          cardImg.src = `/cards_images/54.png`;
          cardImg.style.width = '100px';
      }, 300);
  }
  cardDiv.flipped = !cardDiv.flipped;
}


function transformCardText(cardNum) {
    const symbolNum = Math.floor(cardNum / 13)
    const valueNum = cardNum % 13 + 2;
    const symbol = symbols[symbolNum];
    const value = valueNum < 11 ? valueNum : ['J', 'Q', 'K', 'A'][valueNum - 11];
    return `${value} ${symbol}`;
}

function refreshPlayers(players) {
    const playersElement = document.getElementsByClassName('actions__playerList')[0];
    playersElement.innerHTML = '';

    players.forEach(player => {
        const button = document.createElement('button');
        button.innerHTML = `${player.userName} (${player.numberOfCards} cards)`;
        button.style.cursor = 'pointer';
        button.style.margin = '10px 0';

        button.addEventListener('click', () => {
            socket.send(JSON.stringify({ event: 'giveCard', gameId: gameId, playerId: player.playerId }));
        });

        playersElement.appendChild(button);
    });
}

function connectWebSocket() {
    socket.addEventListener('open', (event) => {
      console.log('WebSocket is open now.');
      joinGame();
    });

    socket.addEventListener('message', (event) => {
      console.log('Message from server ', event.data);
      const data = JSON.parse(event.data);

      if (data.event === 'newRound') {
        displayCards(data.cards);
      }
      else if (data.event === 'error') {
        alert(data.message);
      }
      else if (data.event === 'refreshPlayers') {
        refreshPlayers(data.players);
      }
    });
  }

// add listener to button
document.getElementsByClassName('actions__newround')[0].addEventListener('click', newRound);
// exit button
document.getElementsByClassName('actions__exit')[0].addEventListener('click', () => {
    window.location.href = '/';
});
// show cards button
document.getElementsByClassName('hand__show')[0].addEventListener('click', () => {
    const cards = document.getElementsByClassName('hand__cards')[0].children;
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].flipped) {
            flipCard(cards[i]);
        }
    }
});
// hide cards button
document.getElementsByClassName('hand__hide')[0].addEventListener('click', () => {
    const cards = document.getElementsByClassName('hand__cards')[0].children;
    for (let i = 0; i < cards.length; i++) {
        if (!cards[i].flipped) {
          console.log(cards[i]);
            flipCard(cards[i]);
        }
    }
});
