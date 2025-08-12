import { LobbyStore } from "./LobbyStore";
import LobbyService from "../core/LobbyService";

export class InMemoryLobbyStore implements LobbyStore {
  private store = new Map<number, LobbyService>();

  async saveLobby(lobby: LobbyService) {
    this.store.set(lobby.id, lobby);
  }

  async getLobby(id: number): Promise<LobbyService | null> {
    return this.store.get(id) ?? null;
  }

  async deleteLobby(id: number): Promise<void> {
    this.store.delete(id);
  }

  async listLobbies(): Promise<LobbyService[]> {
    return Array.from(this.store.values());
  }
}
