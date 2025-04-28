const host = location.hostname;
const port = location.port || 3000;
const wsUrl = `ws://${host}:${port}`;

const socket = new WebSocket(wsUrl);

const symbols = ["♣", "♦", "♥", "♠"];

const hand = document.getElementsByClassName("hand")[0];
const giveCardDialog = document.getElementsByClassName("giveCardDialog")[0];

function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const queryArray = queryString.split("&");
  queryArray.forEach((param) => {
    const [key, value] = param.split("=");
    params[key] = decodeURIComponent(value);
  });
  return params;
}

function joinGame() {
  console.log("Joining game");
  socket.send(
    JSON.stringify({ event: "joinGame", gameId: gameId, userName: userName })
  );
}

// Retrieve gameId from the URL query parameters
const queryParams = getQueryParams();
const gameId = queryParams.gameId;
const userName = queryParams.userName;

// Connect to the WebSocket server
connectWebSocket();

function newRound() {
  console.log("New round");
  socket.send(JSON.stringify({ event: "newRound", gameId: gameId }));
}

const innerHands = Array.from(document.getElementsByClassName("hand__inner"));

function displayCards(cards, flipped = false) {
  // Sort the cards
  cards.sort((a, b) => a - b);

  const lastHand = innerHands[innerHands.length - 1];

  if (lastHand.children.length === 0) {
    cards.forEach((cardId) => {
      const cardDiv = createCardDiv(cardId, flipped);
      lastHand.appendChild(cardDiv);
    });

    lastHand.classList.add("card-slide-in");
  } else {
    const lastHand = innerHands.pop();

    lastHand.classList.remove("card-slide-in");
    lastHand.classList.add("card-slide-out");
    lastHand.addEventListener("animationend", () => {
      lastHand.remove();
    });

    // create new handInner parallel to the old one and animate it
    const newHandInner = document.createElement("div");
    newHandInner.className = "hand__inner";
    cards.forEach((cardId) => {
      const cardDiv = createCardDiv(cardId, flipped);
      newHandInner.appendChild(cardDiv);
    });
    newHandInner.classList.add("card-slide-in");
    hand.appendChild(newHandInner);
    innerHands.push(newHandInner);
  }
}

function calculateCardSymbols(cardId) {
  const symbol = symbols[cardId % 4];
  const valueNum = Math.floor(cardId / 4) + 2;
  const value = valueNum < 11 ? valueNum : ["J", "Q", "K", "A"][valueNum - 11];
  return [value, symbol];
}



function createCardDiv(cardId, flipped = false) {
  const cardDiv = document.createElement("div");
  cardDiv.className = "card";

  const cardInner = document.createElement("div");
  cardInner.className = "card_inner";
  cardInner.cardId = cardId;
  if (flipped) {
    cardInner.flipped = true;
    cardInner.classList.add("back");
  } else {
    cardInner.flipped = false;
  }

  const [value, symbol] = calculateCardSymbols(cardId);

  // Create and position elements in each corner
  const corners = ["top-left", "top-right", "card_middle", "bottom-left", "bottom-right"];
  corners.forEach(corner => {
    const cornerContainer = document.createElement("div");
    cornerContainer.classList.add("card_corner", corner);

    if (corner !== "card_middle") {
      const cardNumber = document.createElement("div");
      cardNumber.innerHTML = value;
      cornerContainer.appendChild(cardNumber);
    }

    const cardSymbol = document.createElement("div");
    cardSymbol.innerHTML = symbol;
    cornerContainer.appendChild(cardSymbol);

    cardInner.appendChild(cornerContainer);
  });

  // If symbol is heart or diamond, change color to red
  if (symbol === "♥" || symbol === "♦") {
    cardInner.style.color = "red";
  } else {
    cardInner.style.color = "black";
  }

  cardInner.addEventListener("pointerdown", () => {
    flipCard(cardInner);
  });

  cardDiv.appendChild(cardInner);

  return cardDiv;
}

function flipCard(cardInner) {
  if (cardInner.flipped) {
    cardInner.style.width = "0px";
    setTimeout(() => {
      cardInner.style.width = "100px";
      cardInner.classList.remove("back")
    }, 300);
  } else {
    cardInner.style.width = "0px";
    cardInner.classList.add("back")
    setTimeout(() => {
      cardInner.style.width = "100px";
    }, 300);
  }
  cardInner.flipped = !cardInner.flipped;
}

const playersElement = document.getElementsByClassName(
  "giveCardDialog__players"
)[0];
function refreshPlayers(players) {
  playersElement.innerHTML = "";

  players.forEach((player) => {
    const button = document.createElement("button");
    button.innerHTML = `${player.userName} (${player.numberOfCards} cards)`;
    button.style.cursor = "pointer";

    button.addEventListener("click", () => {
      giveCardDialog.style.display = "none";
      socket.send(
        JSON.stringify({
          event: "giveCard",
          gameId: gameId,
          playerId: player.playerId,
        })
      );
    });

    playersElement.appendChild(button);
  });
}

function connectWebSocket() {
  socket.addEventListener("open", (event) => {
    console.log("WebSocket is open now.");
    joinGame();
  });

  socket.addEventListener("message", (event) => {
    console.log("Message from server ", event.data);
    const data = JSON.parse(event.data);

    if (data.event === "newRound") {
      displayCards(data.cards, true);
    } else if (data.event === "error") {
      alert(data.message);
    } else if (data.event === "refreshPlayers") {
      refreshPlayers(data.players);
    } else if (data.event === "showAll") {
      showAll(data.players);
    }
  });
}

function showAll(players) {
  let cards = [];
  players.forEach((player) => {
    cards = cards.concat(player.cards);
  });

  // sort 
  cards.sort((a, b) => a - b);

  displayCards(cards, false);
}

// add listener to button
document
  .getElementsByClassName("lower__newRound")[0]
  .addEventListener("click", newRound);
// exit button
document
  .getElementsByClassName("upper__exit")[0]
  .addEventListener("click", () => {
    window.location.href = "/";
  });

// show cards button
document
  .getElementsByClassName("corner__show")[0]
  .addEventListener("click", () => {
    const cards = innerHands[0].children;
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].children[0].flipped) {
        flipCard(cards[i].children[0]);
      }
    }
  });

// hide cards button
document
  .getElementsByClassName("corner__hide")[0]
  .addEventListener("click", () => {
    const cards = innerHands[0].children;
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].children[0].flipped) {
        flipCard(cards[i].children[0]);
      }
    }
  });

// give card button
document
  .getElementsByClassName("lower__giveCard")[0]
  .addEventListener("click", () => {
    // toggle give card dialog
    console.log(giveCardDialog.style.display);
    giveCardDialog.style.display =
      giveCardDialog.style.display === "none" || NaN ? "block" : "none";
  });

// close give card dialog
document
  .getElementsByClassName("giveCardDialog__cancel")[0]
  .addEventListener("click", () => {
    giveCardDialog.style.display = "none";
  });

// show all cards button
document
  .getElementsByClassName("lower__showAll")[0]
  .addEventListener("click", ()=>{
    socket.send(JSON.stringify({ event: "showAll", gameId: gameId }));
  });
