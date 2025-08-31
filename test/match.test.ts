import { describe, it, expect } from "vitest";
import LobbyService, {
  LobbyStatusEnum,
  LOBBY_ERRORS,
} from "../src/core/LobbyService";
import PlayerType from "../src/models/Player";
import "reflect-metadata";
import crypto from "crypto";

const player1: PlayerType = {
  id: crypto.randomUUID(),
  name: "A",
  skillLevel: "A1",
  supabaseId: crypto.randomUUID(),
  email: "player1@test.com",
};
let player2: PlayerType = {
  id: crypto.randomUUID(),
  name: "B",
  skillLevel: "A2",
  supabaseId: crypto.randomUUID(),
  email: "player2@test.com",
};
let player3: PlayerType = {
  id: crypto.randomUUID(),
  name: "C",
  skillLevel: "A3",
  supabaseId: crypto.randomUUID(),
  email: "player3@test.com",
};
let player4: PlayerType = {
  id: crypto.randomUUID(),
  name: "D",
  skillLevel: "F1",
  supabaseId: crypto.randomUUID(),
  email: "player4@test.com",
};
let player5: PlayerType = {
  id: crypto.randomUUID(),
  name: "F",
  skillLevel: "F2",
  supabaseId: crypto.randomUUID(),
  email: "player5@test.com",
};

describe("match-engine-lib", () => {
  it("can add player", () => {
    let service = new LobbyService(crypto.randomUUID(), player1, new Date());
    service.addPlayer(player2, "left");

    expect(service.leftSideSlots.length).toBe(2);
    expect(() => service.addPlayer(player2, "left")).toThrow();

    service.removePlayer(player2);
    service.addPlayer(player2, "left");

    expect(service.leftSideSlots.length).toBe(2);

    service.addPlayer(player3, "right");
    service.addPlayer(player4, "right");
    expect(service.status).toBe(LobbyStatusEnum.CONFIRMED);
    expect(service.getAllPlayers.length).toBe(4);
    expect(() => service.addPlayer(player5, "left")).toThrow();
  });

  it("throws when adding player to a side that is full", () => {
    const service = new LobbyService(crypto.randomUUID(), player1, new Date());
    service.addPlayer(player2, "left");
    expect(() => service.addPlayer(player3, "left")).toThrowError(
      LOBBY_ERRORS.LOBBY_FULL
    );
  });
});
