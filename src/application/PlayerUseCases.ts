import { DataSource } from "typeorm";
import { DbPlayerStore } from "../store/DbPlayerStore";
import { PlayerType } from "@/models";

export class PlayerUseCases {
  constructor(private ds: DataSource) {}

  async createPlayer(player: PlayerType): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbPlayerStore(qr.manager);
      await store.create(player);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async updatePlayer(player: PlayerType): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbPlayerStore(qr.manager);
      await store.update(player);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async deletePlayer(id: string): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbPlayerStore(qr.manager);
      await store.delete(id);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getPlayer(id: string): Promise<PlayerType | null> {
    const store = new DbPlayerStore(this.ds.manager);
    return await store.getById(id);
  }

  async listPlayers(): Promise<PlayerType[]> {
    const store = new DbPlayerStore(this.ds.manager);
    return await store.list();
  }
}
