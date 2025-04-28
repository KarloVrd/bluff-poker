

function serializeGames(games) {
    const serializedGames = [];
    for (const gameId in games) {
      const game = games[gameId];
      const serializedGame = {
        gameId: gameId,
        creatorUserName: game.creatorUserName,
        numberOfPlayers: Object.keys(game.players).length,
      };
      serializedGames.push(serializedGame);
    }
    return serializedGames;
}

function serializePlayers(players) {
    const serializedPlayers = [];
    const keys = Object.keys(players);
    for (const playerId of keys) {
      const player = players[playerId];
      const serializedPlayer = {
        userName: player.userName,
        numberOfCards: player.numberOfCards,
        playerId: playerId,
      };
      serializedPlayers.push(serializedPlayer);
    }
    return serializedPlayers;
}

function serializeAllCards(players) {
  const allCards = [];
  const keys = Object.keys(players);
  for (const playerId of keys) {
    const player = players[playerId];
    const serializedCards = {
      userName: player.userName,
      playerId: playerId,
      cards: player.currentCards
    };
    allCards.push(serializedCards);
  }
  return allCards;
}

module.exports = { serializeGames, serializePlayers, serializeAllCards };