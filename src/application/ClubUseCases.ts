import { DataSource } from "typeorm";
import { DbClubStore } from "@/store";
import Club from "../models/Club";

export class ClubUseCases {
  constructor(private ds: DataSource) {}

  async createClub(club: Club): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbClubStore(qr.manager);
      await store.create(club);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async updateClub(club: Club): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbClubStore(qr.manager);
      await store.update(club);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async deleteClub(id: string): Promise<void> {
    const qr = this.ds.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const store = new DbClubStore(qr.manager);
      await store.delete(id);
      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async getClub(id: string): Promise<Club | null> {
    const store = new DbClubStore(this.ds.manager);
    return await store.getById(id);
  }

  async listClubs(): Promise<Club[]> {
    const store = new DbClubStore(this.ds.manager);
    return await store.list();
  }
}
