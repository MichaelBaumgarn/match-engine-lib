import { describe, it, expect } from "vitest";
import LobbyService, { LobbyStatusEnum } from "../src/core/LobbyService";
import PlayerType from "../src/models/Player";

const player1: PlayerType = {
  id: 1,
  name: "A",
};
let player2: PlayerType = {
  id: 3,
  name: "B",
};
let player3: PlayerType = {
  id: 4,
  name: "C",
};
let player4: PlayerType = {
  id: 5,
  name: "D",
};
let player5: PlayerType = {
  id: 6,
  name: "F",
};

describe("match-engine-lib", () => {
  it("can add player", () => {
    let service = new LobbyService(1, player1);
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
});
