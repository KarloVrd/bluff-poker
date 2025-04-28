const serializePlayers = require('./serialization').serializePlayers;

// send a list of players in the game
function sendRefreshPlayersList(players) {
    data = {
        event: 'refreshPlayers',
        players: serializePlayers(players),
    };

    Object.values(players).forEach((player) => {
        player.webSocket.send(JSON.stringify(data));
    });
}
    
module.exports = { sendRefreshPlayersList };