import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { TestDataSource } from "../src/db/test-data-source";
import { LobbyEntity } from "../src/entities/LobbyEntity";
import { PlayerEntity } from "../src/entities/PlayerEntity";
import "reflect-metadata";

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
});
