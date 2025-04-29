const origin = location.origin

const gamesListElement = document.getElementsByClassName('gamesList')[0];

console.log(origin);
function enterGame(gameId, userName) {
    if (userName === '') {
        alert('Please provide a username');
        return;
    }
    if (gameId === '') {
        alert('Please provide a game ID');
        return;
    }
    window.location.href = `${origin}/game.html?gameId=${gameId}&userName=${userName}`;
}

function refreshGamesList(games) {
    gamesListElement.innerHTML = '';
    if (games.length === 0) {
        gamesListElement.style.display = 'none'; // Hide the list if empty
    } else {
        gamesListElement.style.display = 'flex'; // Show the list if not empty
        games.forEach(game => {
            const li = document.createElement('li');
            li.innerHTML = `${game.creatorUserName} (${game.numberOfPlayers} players)`;
            li.style.cursor = 'pointer';

            li.addEventListener('click', () => {
                const userName = document.getElementsByClassName('username__input')[0].value;
                enterGame(game.gameId, userName);
            });
            gamesListElement.appendChild(li);
        });
    } 
}

function createGame() {
    console.log('Creating game');
    const userName = document.getElementsByClassName('username__input')[0].value;
    if (userName === '') {
        alert('Please provide a username');
        return;
    }
    // send a request to the server to create a game
    fetch(`${origin}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userName })
    })
        .then(response => response.json())
        .then(data => {
            // open the game page
            enterGame(data.gameId, userName);
        });
}

function fetchGames() {
    fetch(`${origin}/games`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            refreshGamesList(data);
        });
}

document.getElementsByClassName('create')[0].addEventListener('click', createGame);
document.getElementsByClassName('refresh')[0].addEventListener('click', fetchGames);

fetchGames();