import { LobbyService } from "@/core";

export interface LobbyStore {
  saveLobby(lobby: LobbyService): Promise<void>;
  getLobby(id: string): Promise<LobbyService | null>;
  deleteLobby(id: string): Promise<void>;
  listLobbies(): Promise<LobbyService[]>;
  getLobbiesByPlayerId(playerId: string): Promise<LobbyService[]>;
}
