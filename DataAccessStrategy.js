
class AbstractDataAccess {
    constructor() {
        if (this.constructor === DataAccessStrategy) {
            throw new TypeError('Cannot instantiate abstract class');
        }
    }

    async getGames() {
        throw new Error('Method must be implemented');
    }

    async getGame(id) {
        throw new Error('Method must be implemented');
    }

    async addGame(game) {
        throw new Error('Method must be implemented');
    }

    async updateGame(game) {
        throw new Error('Method must be implemented');
    }

    async deleteGame(id) {
        throw new Error('Method must be implemented');
    }

    async getPlayers(gameId) {
        throw new Error('Method must be implemented');
    }

    async addPlayer(player) {
        throw new Error('Method must be implemented');
    }

    async updatePlayer(player) {
        throw new Error('Method must be implemented');
    }