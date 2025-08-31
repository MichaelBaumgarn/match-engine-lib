// application/LobbyUseCases.ts
import { DataSource } from "typeorm";
import LobbyService, { Side } from "../core/LobbyService";
import Player from "../models/Player";
import { DbLobbyStore } from "../store/DbLobbyStore"; // <- your class that takes an EntityManager

export class LobbyUseCases {
  constructor(private ds: DataSource) {}

  async joinLobby(
    lobbyId: string,
    player: Player,
    side: Side
  ): Promise<LobbyService> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbLobbyStore(qr.manager);
      const lobby = await store.getLobby(lobbyId);
      if (!lobby) throw new Error("Lobby not found");

      lobby.addPlayer(player, side);
      await store.saveLobby(lobby);

      await qr.commitTransaction();
      return lobby;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async leaveLobby(lobbyId: string, player: Player): Promise<LobbyService> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbLobbyStore(qr.manager);
      const lobby = await store.getLobby(lobbyId);
      if (!lobby) throw new Error("Lobby not found");

      lobby.removePlayer(player);
      await store.saveLobby(lobby);

      await qr.commitTransaction();
      return lobby;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async createLobby(
    lobbyId: string,
    creator: Player,
    startAt: Date,
    durationMinutes: number,
    clubId?: string,
    courtName?: string
  ): Promise<LobbyService> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbLobbyStore(qr.manager);
      const lobby = new LobbyService(
        lobbyId,
        creator,
        startAt,
        durationMinutes,
        courtName
      );

      // Ensure courtName is set properly (in case constructor doesn't work)
      if (!lobby.courtName || lobby.courtName === "Court 1") {
        lobby.courtName = courtName || "Court 1";
      }

      // Set club if provided
      if (clubId) {
        lobby.club = {
          id: clubId,
          name: "",
          address: "",
          city: "",
          slug: null,
        };
      }

      await store.saveLobby(lobby);
      await qr.commitTransaction();
      return lobby;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
