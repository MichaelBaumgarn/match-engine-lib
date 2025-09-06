import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";

import { DataSource } from "typeorm";
import crypto from "crypto";
import LobbyService, { Side } from "../core/LobbyService";
import { DbLobbyStore } from "../store/DbLobbyStore";
import { LobbyUseCases } from "../application/LobbyUseCases";
import Player from "../models/Player";
import { DbPlayerStore } from "../store/DbPlayerStore";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Zod schema for lobby creation
const createLobbySchema = z.object({
  creatorId: z.string().uuid("Invalid creatorId format"),
  startAt: z
    .string()
    .datetime("Invalid startAt format")
    .transform((val) => new Date(val)),
  durationMinutes: z.number().int().positive("Duration must be positive"),
  clubId: z.string().uuid("Invalid clubId format").optional(),
  courtName: z.string().min(1, "Court name is required").optional(),
  maxPlayersBySide: z.number().int().positive().min(2).max(10).optional(),
});

export default function lobbiesRouter(ds: DataSource) {
  const router = Router();
  const useCases = new LobbyUseCases(ds);

  // POST /lobbies  { creatorId, lobbyId?, clubId?, courtName?, maxPlayersBySide? }
  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      // Validate request body with Zod
      const validationResult = createLobbySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.issues,
        });
      }

      const {
        creatorId,
        startAt,
        durationMinutes,
        clubId,
        courtName,
        maxPlayersBySide,
      } = validationResult.data;

      // Fetch the actual player from the database
      const playerStore = new DbPlayerStore(ds.manager);
      const creator = await playerStore.getById(creatorId);
      if (!creator) {
        return res.status(404).json({ error: "Creator player not found" });
      }

      const lobbyId = crypto.randomUUID();

      const lobby = await useCases.createLobby({
        lobbyId,
        creator: creator,
        startAt,
        durationMinutes,
        clubId,
        courtName,
        maxPlayersBySide,
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

  // GET /lobbies/player/:playerId
  router.get(
    "/player/:playerId",
    asyncHandler(async (req: Request, res: Response) => {
      const playerId = req.params.playerId;
      const playerStore = new DbPlayerStore(ds.manager);

      // Validate player exists
      const player = await playerStore.getById(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      const lobbies = await useCases.getLobbiesByPlayerId(playerId);

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
    maxPlayersBySide: lobby.maxPlayersBySide,
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
    maxPlayersBySide: lobby.maxPlayersBySide,
    playerCount: {
      left: lobby.leftSideSlots.length,
      right: lobby.rightSideSlots.length,
      total: lobby.getAllPlayers.length,
    },
  };
}
