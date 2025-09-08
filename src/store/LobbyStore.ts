import { LobbyService } from "@/core";
import { LobbyFilters } from "@/application";

export interface LobbyStore {
  saveLobby(lobby: LobbyService): Promise<void>;
  getLobby(id: string): Promise<LobbyService | null>;
  deleteLobby(id: string): Promise<void>;
  listLobbies(filters?: LobbyFilters): Promise<LobbyService[]>;
  getLobbiesByPlayerId(playerId: string): Promise<LobbyService[]>;
}
