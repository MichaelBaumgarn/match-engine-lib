import LobbyService from "../core/LobbyService";

export interface LobbyStore {
  saveLobby(lobby: LobbyService): Promise<void>;
  getLobby(id: number): Promise<LobbyService | null>;
  deleteLobby(id: number): Promise<void>;
  listLobbies(): Promise<LobbyService[]>;
}
