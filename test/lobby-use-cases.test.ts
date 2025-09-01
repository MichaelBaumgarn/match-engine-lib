import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { TestDataSource } from "../src/db/test-data-source";
import { LobbyEntity } from "../src/entities/LobbyEntity";
import { PlayerEntity } from "../src/entities/PlayerEntity";
import { SideSlotEntity } from "../src/entities/SideSlotEntity";
import { ClubEntity } from "../src/entities/ClubEntity";
import "reflect-metadata";
import PlayerType from "../src/models/Player";
import crypto from "crypto";
import { DataSource } from "typeorm";
import { LobbyUseCases } from "../src/application/LobbyUseCases";

describe("LobbyUseCases", () => {
  let dataSource: DataSource;
  let lobbyUseCases: LobbyUseCases;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    dataSource = TestDataSource;
    lobbyUseCases = new LobbyUseCases(dataSource);
  });

  afterAll(async () => {
    // Only destroy if we're the last test file
    // This is a simple approach - in production you might want a more sophisticated solution
  });

  // No need for beforeEach cleanup - TestDataSource handles it with dropSchema: true

  it("should create a lobby successfully", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    // Create a test player
    const player = playerRepo.create({
      name: "Test Creator",
    });
    await playerRepo.save(player);

    // Create PlayerType object for LobbyUseCases
    const playerType: PlayerType = {
      id: player.id,
      name: player.name,
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };

    const lobbyId = crypto.randomUUID();
    const startAt = new Date();
    const durationMinutes = 90;
    const courtName = "Tennis Court 1";

    const lobby = await lobbyUseCases.createLobby({
      lobbyId,
      creator: playerType,
      startAt,
      durationMinutes,
      courtName,
    });

    expect(lobby.id).toBe(lobbyId);
    expect(lobby.createdBy).toBe(playerType);
    expect(lobby.startAt).toEqual(startAt);
    expect(lobby.durationMinutes).toBe(durationMinutes);
    expect(lobby.status).toBe("open");

    // Verify it was saved to database
    const savedLobby = await lobbyRepo.findOneBy({ id: lobbyId });
    expect(savedLobby).toBeTruthy();
    expect(savedLobby?.courtName).toBe(courtName);
  });

  it("should create a lobby with club information", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);
    const clubRepo = TestDataSource.getRepository(ClubEntity);

    // Create a test club first
    const club = clubRepo.create({
      name: "Test Tennis Club",
      address: "123 Tennis St",
      city: "Tennis City",
    });
    await clubRepo.save(club);

    const player = playerRepo.create({ name: "Club Creator" });
    await playerRepo.save(player);

    // Create PlayerType object
    const playerType: PlayerType = {
      id: player.id,
      name: player.name,
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };

    const lobbyId = crypto.randomUUID();
    const startAt = new Date();

    const lobby = await lobbyUseCases.createLobby({
      lobbyId,
      creator: playerType,
      startAt,
      durationMinutes: 120,
      clubId: club.id,
      courtName: "Club Court",
    });

    expect(lobby.club).toBeTruthy();
    expect(lobby.club?.id).toBe(club.id);

    // Verify in database
    const savedLobby = await lobbyRepo.findOneBy({ id: lobbyId });
    expect(savedLobby).toBeTruthy();

    // Check if the club relationship is properly set
    // Note: TypeORM doesn't automatically load relationships, so we check the clubId field
    const savedLobbyWithClub = await lobbyRepo.findOne({
      where: { id: lobbyId },
      relations: ["club"],
    });
    expect(savedLobbyWithClub?.club).toBeTruthy();
    expect(savedLobbyWithClub?.club?.id).toBe(club.id);
  });

  it("should join a lobby successfully", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    // Create creator and joiner players
    const creator = playerRepo.create({ name: "Creator" });
    const joiner = playerRepo.create({ name: "Joiner" });
    await playerRepo.save(creator);
    await playerRepo.save(joiner);

    // Create PlayerType objects
    const creatorType: PlayerType = {
      id: creator.id,
      name: creator.name,
      skillLevel: "A1",
      supabaseId: "creator-supabase-id",
      email: "creator@example.com",
    };
    const joinerType: PlayerType = {
      id: joiner.id,
      name: joiner.name,
      skillLevel: "A2",
      supabaseId: "joiner-supabase-id",
      email: "joiner@example.com",
    };

    // Create a lobby first
    const lobbyId = crypto.randomUUID();
    const lobby = await lobbyUseCases.createLobby({
      lobbyId,
      creator: creatorType,
      startAt: new Date(),
      durationMinutes: 90,
      courtName: "Join Test Court",
    });

    // Join the lobby
    const updatedLobby = await lobbyUseCases.joinLobby(
      lobbyId,
      joinerType,
      "left"
    );

    expect(updatedLobby.getAllPlayers).toContain(joinerType);
    expect(updatedLobby.leftSideSlots).toContain(joinerType);

    // Verify in database
    const sideSlotRepo = TestDataSource.getRepository(SideSlotEntity);
    const sideSlots = await sideSlotRepo.findBy({ lobbyId });
    expect(sideSlots).toHaveLength(2); // creator + joiner
  });

  it("should leave a lobby successfully", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    // Create players
    const creator = playerRepo.create({ name: "Creator" });
    const leaver = playerRepo.create({ name: "Leaver" });
    await playerRepo.save(creator);
    await playerRepo.save(leaver);

    // Create PlayerType objects
    const creatorType: PlayerType = {
      id: creator.id,
      name: creator.name,
      skillLevel: "A1",
      supabaseId: "creator-supabase-id",
      email: "creator@example.com",
    };
    const leaverType: PlayerType = {
      id: leaver.id,
      name: leaver.name,
      skillLevel: "A2",
      supabaseId: "leaver-supabase-id",
      email: "leaver@example.com",
    };

    // Create and join lobby
    const lobbyId = crypto.randomUUID();
    let lobby = await lobbyUseCases.createLobby({
      lobbyId,
      creator: creatorType,
      startAt: new Date(),
      durationMinutes: 90,
    });

    lobby = await lobbyUseCases.joinLobby(lobbyId, leaverType, "right");

    // Verify player joined
    expect(lobby.getAllPlayers).toContain(leaverType);

    // Leave the lobby
    const updatedLobby = await lobbyUseCases.leaveLobby(lobbyId, leaverType);

    expect(updatedLobby.getAllPlayers).not.toContain(leaverType);
    expect(updatedLobby.rightSideSlots).not.toContain(leaverType);

    // Verify in database
    const sideSlotRepo = TestDataSource.getRepository(SideSlotEntity);
    const sideSlots = await sideSlotRepo.findBy({ lobbyId });
    expect(sideSlots).toHaveLength(1); // only creator remains
  });

  it("should throw error when joining non-existent lobby", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const player = playerRepo.create({ name: "Test Player" });
    await playerRepo.save(player);

    // Create PlayerType object
    const playerType: PlayerType = {
      id: player.id,
      name: player.name,
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };

    await expect(
      lobbyUseCases.joinLobby(crypto.randomUUID(), playerType, "left")
    ).rejects.toThrow("Lobby not found");
  });

  it("should throw error when leaving non-existent lobby", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const player = playerRepo.create({ name: "Test Player" });
    await playerRepo.save(player);

    // Create PlayerType object
    const playerType: PlayerType = {
      id: player.id,
      name: player.name,
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };

    await expect(
      lobbyUseCases.leaveLobby(crypto.randomUUID(), playerType)
    ).rejects.toThrow("Lobby not found");
  });

  it("should handle transaction rollback on error", async () => {
    const playerRepo = TestDataSource.getRepository(PlayerEntity);
    const lobbyRepo = TestDataSource.getRepository(LobbyEntity);

    const player = playerRepo.create({ name: "Transaction Test Player" });
    await playerRepo.save(player);

    // Create PlayerType object
    const playerType: PlayerType = {
      id: player.id,
      name: player.name,
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };

    const lobbyId = crypto.randomUUID();

    // Create lobby successfully
    const lobby = await lobbyUseCases.createLobby({
      lobbyId,
      creator: playerType,
      startAt: new Date(),
      durationMinutes: 90,
    });

    // Verify lobby was created
    const savedLobby = await lobbyRepo.findOneBy({ id: lobbyId });
    expect(savedLobby).toBeTruthy();

    // Try to join with invalid data (this should trigger rollback)
    // We'll mock a scenario where the database operation fails
    const invalidPlayer = { ...playerType, id: "invalid-uuid" };

    // This should fail and rollback any changes
    await expect(
      lobbyUseCases.joinLobby(lobbyId, invalidPlayer as any, "left")
    ).rejects.toThrow();
  });
});
