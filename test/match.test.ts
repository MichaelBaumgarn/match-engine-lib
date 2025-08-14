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

describe("match-engine-lib", () => {
  it("can add player", () => {
    let service = new LobbyService(crypto.randomUUID(), player1);
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
    const service = new LobbyService(crypto.randomUUID(), player1);
    service.addPlayer(player2, "left");
    expect(() => service.addPlayer(player3, "left")).toThrowError(
      LOBBY_ERRORS.LOBBY_FULL
    );
  });
});
