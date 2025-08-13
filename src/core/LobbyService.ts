import PlayerType from "../models/Player";

export const LOBBY_ERRORS = {
  LOBBY_FULL: "Lobby is full",
  PLAYER_EXISTS_ALREADY: "player was already added",
  PLAYER_NOT_FOUND: "player was not found",
};

export enum LobbyStatusEnum {
  OPEN = "open",
  CONFIRMED = "confirmed",
}

export type Side = "left" | "right";

class LobbyService {
  id: string;
  createdBy: PlayerType;
  maxPlayersBySide: number = 2;
  leftSideSlots: PlayerType[];
  rightSideSlots: PlayerType[] = [];
  status: LobbyStatusEnum = LobbyStatusEnum.OPEN;

  constructor(id: string, createdBy: PlayerType) {
    this.id = id;
    this.createdBy = createdBy;
    this.leftSideSlots = [createdBy];
  }

  isFull() {
    return (
      this.leftSideSlots.length >= this.maxPlayersBySide &&
      this.rightSideSlots.length >= this.maxPlayersBySide
    );
  }

  get getAllPlayers() {
    return [...this.leftSideSlots, ...this.rightSideSlots];
  }

  addPlayer(player: PlayerType, side: Side) {
    if (this.isFull()) throw new Error(LOBBY_ERRORS.LOBBY_FULL);
    if (this.hasPlayer(player))
      throw new Error(LOBBY_ERRORS.PLAYER_EXISTS_ALREADY);

    const targetSide =
      side == "left" ? this.leftSideSlots : this.rightSideSlots;

    if (targetSide.length < this.maxPlayersBySide) {
      targetSide.push(player);
    }

    if (this.isFull()) {
      this.status = LobbyStatusEnum.CONFIRMED;
    }
    return true;
  }

  removePlayer(player: PlayerType) {
    if (!this.hasPlayer(player)) throw new Error(LOBBY_ERRORS.PLAYER_NOT_FOUND);

    this.leftSideSlots = this.leftSideSlots.filter(
      (presentPlayer) => presentPlayer.id !== player.id
    );
    this.rightSideSlots = this.rightSideSlots.filter(
      (presentPlayer) => presentPlayer.id !== player.id
    );
    if (!this.isFull()) this.status = LobbyStatusEnum.OPEN;
    return true;
  }

  hasPlayer(player: PlayerType) {
    return this.getAllPlayers.find(
      (presentPlayer) => player.id === presentPlayer.id
    );
  }
}
export default LobbyService;
