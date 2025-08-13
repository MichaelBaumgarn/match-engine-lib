import LobbyService from "../core/LobbyService";

export interface LobbyStore {
  saveLobby(lobby: LobbyService): Promise<void>;
  getLobby(id: string): Promise<LobbyService | null>;
  deleteLobby(id: string): Promise<void>;
  listLobbies(): Promise<LobbyService[]>;
}
