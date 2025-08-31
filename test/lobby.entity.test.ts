import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { TestDataSource } from "../src/db/test-data-source";
import { LobbyEntity } from "../src/entities/LobbyEntity";
import { PlayerEntity } from "../src/entities/PlayerEntity";
import { SideSlotEntity } from "../src/entities/SideSlotEntity";
import "reflect-metadata";
import { InMemoryLobbyStore } from "../src/store/InMemoryLobbyStore";
import { DbLobbyStore } from "../src/store/DbLobbyStore";
import LobbyService, { LOBBY_ERRORS } from "../src/core/LobbyService";
import PlayerType from "../src/models/Player";
import crypto from "crypto";
import { DataSource, EntityManager } from "typeorm";

const player1: PlayerType = {
  id: crypto.randomUUID(),
  name: "A",
};
let player2: PlayerType = {
  id: crypto.randomUUID(),
  name: "B",
};
let player3: PlayerType = {
  id: crypto.randomUUID(),
  name: "C",
};
let player4: PlayerType = {
  id: crypto.randomUUID(),
  name: "D",
};
let player5: PlayerType = {
  id: crypto.randomUUID(),
  name: "F",
};

describe("LobbyEntity CRUD", () => {
  beforeAll(async () => {
    await TestDataSource.initialize();
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  it("should create and read a lobby", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    const player = playerRepo.create({
      name: "Test Player",
    });
    await playerRepo.save(player);

    const lobby = lobbyRepo.create({
      createdBy: player.id,
      status: "open",
      visibility: "public",
      startAt: new Date(),
      durationMinutes: 90,
      courtName: "Default Court",
    });
    await lobbyRepo.save(lobby);

    const saved = await lobbyRepo.findOneByOrFail({ id: lobby.id });
    expect(saved.status).toBe("open");
    expect(saved.createdBy).toBe(player.id);
  });

  it("should update a lobby", async () => {
    const repo = TestDataSource.getRepository(LobbyEntity);
    const lobby = await repo.findOneByOrFail({});
    lobby.status = "confirmed";
    await repo.save(lobby);

    const updated = await repo.findOneByOrFail({ id: lobby.id });
    expect(updated.status).toBe("confirmed");
  });

  it("should delete a lobby", async () => {
    const repo = TestDataSource.getRepository(LobbyEntity);
    const lobby = await repo.findOneByOrFail({});
    await repo.delete(lobby.id);

    const found = await repo.findOneBy({ id: lobby.id });
    expect(found).toBeNull();
  });

  it("should create a side slot with a UUID playerId", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);
    const sideRepo = TestDataSource.getRepository(SideSlotEntity);

    const player = playerRepo.create({ name: "Slot Player" });
    await playerRepo.save(player);

    const lobby = lobbyRepo.create({
      createdBy: player.id,
      status: "open",
      visibility: "public",
      durationMinutes: 90,
      startAt: new Date(),
      courtName: "Default Court",
    });
    await lobbyRepo.save(lobby);

    const sideSlot = sideRepo.create({
      playerId: player.id,
      side: "left",
      lobbyId: lobby.id,
    });

    await sideRepo.save(sideSlot);
    const savedSlot = await sideRepo.findOneByOrFail({ id: sideSlot.id });
    expect(savedSlot.playerId).toBe(player.id);
  });

  it("should create a lobby with court name", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    const player = playerRepo.create({ name: "Court Test Player" });
    await playerRepo.save(player);

    const lobby = lobbyRepo.create({
      createdBy: player.id,
      status: "open",
      visibility: "public",
      durationMinutes: 90,
      startAt: new Date(),
      courtName: "Tennis Court 1",
    });
    await lobbyRepo.save(lobby);

    const saved = await lobbyRepo.findOneByOrFail({ id: lobby.id });
    expect(saved.courtName).toBe("Tennis Court 1");
    expect(saved.status).toBe("open");
    expect(saved.createdBy).toBe(player.id);
  });
});
