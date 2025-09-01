import { Router, Request, Response, NextFunction } from "express";

import { DataSource } from "typeorm";
import crypto from "crypto";
import LobbyService, { Side } from "../core/LobbyService";
import { DbLobbyStore } from "../store/DbLobbyStore";
import { LobbyUseCases } from "../application/LobbyUseCases";
import Player from "../models/Player";
import { DbPlayerStore } from "../store/DbPlayerStore";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default function lobbiesRouter(ds: DataSource) {
  const router = Router();
  const useCases = new LobbyUseCases(ds);

  // POST /lobbies  { creatorId, lobbyId?, clubId?, courtName? }
  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const creatorId: string = req.body.creatorId;
      if (!creatorId)
        return res.status(400).json({ error: "creatorId required" });

      // Fetch the actual player from the database
      const playerStore = new DbPlayerStore(ds.manager);
      const creator = await playerStore.getById(creatorId);
      if (!creator) {
        return res.status(404).json({ error: "Creator player not found" });
      }

      const lobbyId: string = req.body.lobbyId ?? crypto.randomUUID();
      const startAt: Date = req.body.startAt;
      const durationMinutes: number = req.body.durationMinutes;
      const clubId: string = req.body.clubId;
      const courtName: string = req.body.courtName;
      if (!startAt) return res.status(400).json({ error: "startAt required" });

      const lobby = await useCases.createLobby({
        lobbyId,
        creator,
        startAt,
        durationMinutes,
        clubId,
        courtName,
      });
      res.status(201).json(serializeLobby(lobby));
    })
  );

  // GET /lobbies/:id
  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const store = new DbLobbyStore(ds.manager);
      const playerStore = new DbPlayerStore(ds.manager);
      const lobby = await store.getLobby(req.params.id);
      if (!lobby) return res.status(404).json({ error: "Lobby not found" });

      // Always include player details for individual lobby view
      const lobbyWithDetails = await serializeLobbyWithPlayerDetails(
        lobby,
        playerStore
      );
      res.json(lobbyWithDetails);
    })
  );

  // GET /lobbies
  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const store = new DbLobbyStore(ds.manager);
      const playerStore = new DbPlayerStore(ds.manager);
      const lobbies = await store.listLobbies();

      // Check if client wants detailed player info
      const includePlayers = req.query.includePlayers === "true";

      if (includePlayers) {
        const lobbiesWithDetails = await Promise.all(
          lobbies.map((lobby) =>
            serializeLobbyWithPlayerDetails(lobby, playerStore)
          )
        );
        res.json(lobbiesWithDetails);
      } else {
        res.json(lobbies.map(serializeLobby));
      }
    })
  );

  // POST /lobbies/:id/join  { playerId, side }
  router.post(
    "/:id/join",
    asyncHandler(async (req: Request, res: Response) => {
      const { playerId, side } = req.body as { playerId?: string; side?: Side };
      if (!playerId)
        return res.status(400).json({ error: "playerId required" });
      if (side !== "left" && side !== "right")
        return res
          .status(400)
          .json({ error: "side must be 'left' or 'right'" });

      const player: Player = {
        id: playerId,
        name: "?",
        skillLevel: "A1",
        supabaseId: playerId,
        email: "unknown@example.com",
      };
      const lobby = await useCases.joinLobby(req.params.id, player, side);
      res.json(serializeLobby(lobby));
    })
  );

  // POST /lobbies/:id/leave  { playerId }
  router.post(
    "/:id/leave",
    asyncHandler(async (req: Request, res: Response) => {
      const { playerId } = req.body as { playerId?: string };
      if (!playerId)
        return res.status(400).json({ error: "playerId required" });

      const player: Player = {
        id: playerId,
        name: "?",
        skillLevel: "A1",
        supabaseId: playerId,
        email: "unknown@example.com",
      };
      const lobby = await useCases.leaveLobby(req.params.id, player);
      res.json(serializeLobby(lobby));
    })
  );

  // DELETE /lobbies/:id
  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const store = new DbLobbyStore(ds.manager);
      const lobby = await store.getLobby(req.params.id);
      if (!lobby) return res.status(404).json({ error: "Lobby not found" });
      await store.deleteLobby(req.params.id);
      res.status(204).send();
    })
  );

  return router;
}

// shape responses for clients
function serializeLobby(lobby: LobbyService) {
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
  };
}

// Enhanced serialization with player details
async function serializeLobbyWithPlayerDetails(
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
    playerCount: {
      left: lobby.leftSideSlots.length,
      right: lobby.rightSideSlots.length,
      total: lobby.getAllPlayers.length,
    },
  };
}
