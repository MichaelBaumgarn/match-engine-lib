import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { DataSource } from "typeorm";
import { TestDataSource } from "../src/db/test-data-source";
import { LobbyUseCases } from "../src/application/LobbyUseCases";
import Player from "../src/models/Player";
import crypto from "crypto";

describe("Court Name Integration Tests", () => {
  let ds: DataSource;
  let useCases: LobbyUseCases;

  beforeAll(async () => {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
    }
    useCases = new LobbyUseCases(TestDataSource);
  });

  afterAll(async () => {
    // Don't destroy the shared TestDataSource
  });

  it("should create a lobby with custom court name", async () => {
    const lobbyId = crypto.randomUUID();
    const creator: Player = {
      id: crypto.randomUUID(),
      name: "Court Test Player",
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };
    const startAt = new Date();
    const durationMinutes = 90;
    const customCourtName = "Tennis Court 2";

    const lobby = await useCases.createLobby({
      lobbyId,
      creator,
      startAt,
      durationMinutes,
      courtName: customCourtName,
    });

    expect(lobby.courtName).toBe(customCourtName);
    expect(lobby.id).toBe(lobbyId);
    expect(lobby.createdBy.id).toBe(creator.id);
  });

  it("should create a lobby with default court name when not provided", async () => {
    const lobbyId = crypto.randomUUID();
    const creator: Player = {
      id: crypto.randomUUID(),
      name: "Default Court Test Player",
      skillLevel: "A2",
      supabaseId: "test-supabase-id-2",
      email: "test2@example.com",
    };
    const startAt = new Date();
    const durationMinutes = 90;

    const lobby = await useCases.createLobby({
      lobbyId,
      creator,
      startAt,
      durationMinutes,
      // courtName not provided, should use default
    });

    expect(lobby.courtName).toBe("Default Court");
    expect(lobby.id).toBe(lobbyId);
    expect(lobby.createdBy.id).toBe(creator.id);
  });
});
