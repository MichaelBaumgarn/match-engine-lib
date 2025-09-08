import { LobbyStore } from "./LobbyStore";
import { LobbyService } from "@/core";
import { LobbyQueryService, LobbyFilters } from "../application/LobbyQueryService";

export class InMemoryLobbyStore implements LobbyStore {
  private store = new Map<string, LobbyService>();

  async saveLobby(lobby: LobbyService) {
    this.store.set(lobby.id, lobby);
  }

  async getLobby(id: string): Promise<LobbyService | null> {
    return this.store.get(id) ?? null;
  }

  async deleteLobby(id: string): Promise<void> {
    this.store.delete(id);
  }

  async listLobbies(filters?: LobbyFilters): Promise<LobbyService[]> {
    const lobbies = Array.from(this.store.values());
    
    if (!filters) {
      return lobbies.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    }

    return LobbyQueryService.filterInMemoryLobbies(lobbies, filters);
  }

  async getLobbiesByPlayerId(playerId: string): Promise<LobbyService[]> {
    return Array.from(this.store.values()).filter(lobby => 
      lobby.getAllPlayers.some(player => player.id === playerId)
    );
  }
}
