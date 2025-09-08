import { LobbyService } from "@/core";
import { DbPlayerStore } from "@/store";

export function serializeLobby(lobby: LobbyService) {
  return {
    id: lobby.id,
    status: lobby.status,
    leftSide: lobby.leftSideSlots.map((p) => p.id),
    rightSide: lobby.rightSideSlots.map((p) => p.id),
    players: lobby.getAllPlayers.map((p) => p.id),
    createdBy: lobby.createdBy.id,
    club: lobby.club,
    startAt: lobby.startAt,
    durationMinutes: lobby.durationMinutes,
    courtName: lobby.courtName,
    maxPlayersBySide: lobby.maxPlayersBySide,
  };
}

export async function serializeLobbyWithPlayerDetails(
  lobby: LobbyService,
  playerStore: DbPlayerStore
) {
  const allPlayerIds = lobby.getAllPlayers.map((p) => p.id);
  const players = await playerStore.getPlayersByIds(allPlayerIds);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const leftSidePlayers = lobby.leftSideSlots.map((p) => {
    const player = playerMap.get(p.id);
    return player || { id: p.id, name: "Unknown Player" };
  });

  const rightSidePlayers = lobby.rightSideSlots.map((p) => {
    const player = playerMap.get(p.id);
    return player || { id: p.id, name: "Unknown Player" };
  });

  const creator = playerMap.get(lobby.createdBy.id) || {
    id: lobby.createdBy.id,
    name: "Unknown Player",
  };

  return {
    id: lobby.id,
    status: lobby.status,
    leftSide: leftSidePlayers,
    rightSide: rightSidePlayers,
    players: players,
    createdBy: creator,
    club: lobby.club,
    startAt: lobby.startAt,
    durationMinutes: lobby.durationMinutes,
    courtName: lobby.courtName,
    maxPlayersBySide: lobby.maxPlayersBySide,
    playerCount: {
      left: lobby.leftSideSlots.length,
      right: lobby.rightSideSlots.length,
      total: lobby.getAllPlayers.length,
    },
  };
}