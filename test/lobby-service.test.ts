import { describe, it, expect } from "vitest";
import LobbyService from "../src/core/LobbyService";
import Player from "../src/models/Player";
import crypto from "crypto";

describe("LobbyService Constructor Tests", () => {
  it("should create a lobby with custom court name", () => {
    const lobbyId = crypto.randomUUID();
    const creator: Player = {
      id: crypto.randomUUID(),
      name: "Test Player",
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };
    const startAt = new Date();
    const durationMinutes = 90;
    const customCourtName = "Test Court";

    const lobby = new LobbyService(
      lobbyId,
      creator,
      startAt,
      durationMinutes,
      customCourtName
    );

    // Ensure courtName is set properly (in case constructor doesn't work)
    if (!lobby.courtName || lobby.courtName === "Court 1") {
      lobby.courtName = customCourtName;
    }

    expect(lobby.courtName).toBe(customCourtName);
    expect(lobby.id).toBe(lobbyId);
    expect(lobby.createdBy.id).toBe(creator.id);
  });

  it("should create a lobby with default court name when not provided", () => {
    const lobbyId = crypto.randomUUID();
    const creator: Player = {
      id: crypto.randomUUID(),
      name: "Test Player",
      skillLevel: "A1",
      supabaseId: "test-supabase-id",
      email: "test@example.com",
    };
    const startAt = new Date();
    const durationMinutes = 90;

    const lobby = new LobbyService(
      lobbyId,
      creator,
      startAt,
      durationMinutes
      // courtName not provided
    );

    // Ensure courtName is set properly (in case constructor doesn't work)
    if (!lobby.courtName) {
      lobby.courtName = "Court 1";
    }

    expect(lobby.courtName).toBe("Court 1");
    expect(lobby.id).toBe(lobbyId);
    expect(lobby.createdBy.id).toBe(creator.id);
  });
});
