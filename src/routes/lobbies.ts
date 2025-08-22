import { Router, Request, Response, NextFunction } from "express";

import { DataSource } from "typeorm";
import crypto from "crypto";
import LobbyService, { Side } from "../core/LobbyService";
import { DbLobbyStore } from "../store/DbLobbyStore";
import { LobbyUseCases } from "../application/LobbyUseCases";
import Player from "../models/Player";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default function lobbiesRouter(ds: DataSource) {
  const router = Router();
  const useCases = new LobbyUseCases(ds);

  // POST /lobbies  { creatorId, lobbyId? }
  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const creatorId: string = req.body.creatorId;
      if (!creatorId)
        return res.status(400).json({ error: "creatorId required" });

      const lobbyId: string = req.body.lobbyId ?? crypto.randomUUID();
      const creator: Player = { id: creatorId, name: "?" };
      const startAt: Date = req.body.startAt;
      const durationMinutes: number = req.body.durationMinutes;
      if (!startAt) return res.status(400).json({ error: "startAt required" });

      const lobby = await useCases.createLobby(
        lobbyId,
        creator,
        startAt,
        durationMinutes
      );
      res.status(201).json(serializeLobby(lobby));
    })
  );

  // GET /lobbies/:id
  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const store = new DbLobbyStore(ds.manager);
      const lobby = await store.getLobby(req.params.id);
      if (!lobby) return res.status(404).json({ error: "Lobby not found" });
      res.json(serializeLobby(lobby));
    })
  );

  // GET /lobbies
  router.get(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const store = new DbLobbyStore(ds.manager);
      const lobbies = await store.listLobbies();
      res.json(lobbies.map(serializeLobby));
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

      const player: Player = { id: playerId, name: "?" };
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

      const player: Player = { id: playerId, name: "?" };
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
  };
}
