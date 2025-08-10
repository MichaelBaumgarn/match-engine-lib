import PlayerType from "../models/Player";

export const LOBBY_ERRORS = {
  LOBBY_FULL: "Lobby is full",
  PLAYER_EXISTS_ALREADY: "player was already added",
  PLAYER_NOT_FOUND: "player was not found",
};

class LobbyService {
  id: number;
  createdBy: PlayerType;
  maxPlayers: number = 4;
  players: PlayerType[];

  constructor(id: number, createdBy: PlayerType) {
    this.id = id;
    this.createdBy = createdBy;
    this.players = [createdBy];
  }

  addPlayer(player: PlayerType) {
    if (this.players.length >= this.maxPlayers)
      throw new Error(LOBBY_ERRORS.LOBBY_FULL);
    if (this.hasPlayer(player))
      throw new Error(LOBBY_ERRORS.PLAYER_EXISTS_ALREADY);

    this.players.push(player);
    return true;
  }

  removePlayer(player: PlayerType) {
    if (!this.hasPlayer(player)) throw new Error(LOBBY_ERRORS.PLAYER_NOT_FOUND);

    this.players = this.players.filter(
      (presentPlayer) => presentPlayer.id !== player.id
    );
    return true;
  }

  hasPlayer(player: PlayerType) {
    return this.players.find((presentPlayer) => player.id === presentPlayer.id);
  }
}
export default LobbyService;
