import { PlayerType } from "@/models";
import crypto from "crypto";
import { Request, Response, Router } from "express";
import { DataSource } from "typeorm";
import { serializeLobby, serializeLobbyWithPlayerDetails, LobbyUseCases } from "@/application";
import { createLobbySchema, joinLobbySchema, leaveLobbySchema, lobbyFiltersSchema } from "@/schemas";
import { DbLobbyStore, DbPlayerStore } from "@/store";

export function lobbiesRouter(ds: DataSource) {
  const router = Router();
  const useCases = new LobbyUseCases(ds);


  //MARK: Handlers
  async function createLobby(req: Request, res: Response) {
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
  }

  async function getLobbyById(req: Request, res: Response) {
    const store = new DbLobbyStore(ds.manager);
    const playerStore = new DbPlayerStore(ds.manager);
    const lobby = await store.getLobby(req.params.id);
    if (!lobby) return res.status(404).json({ error: "Lobby not found" });

    const lobbyWithDetails = await serializeLobbyWithPlayerDetails(
      lobby,
      playerStore
    );
    res.json(lobbyWithDetails);
  }

  async function listLobbies(req: Request, res: Response) {
    const store = new DbLobbyStore(ds.manager);
    const playerStore = new DbPlayerStore(ds.manager);

    const filtersResult = lobbyFiltersSchema.safeParse(req.query);
    if (!filtersResult.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: filtersResult.error.issues,
      });
    }

    const lobbies = await store.listLobbies(filtersResult.data);
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
  }

  async function getLobbiesByPlayer(req: Request, res: Response) {
    const playerId = req.params.playerId;
    const playerStore = new DbPlayerStore(ds.manager);

    const player = await playerStore.getById(playerId);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    const lobbies = await useCases.getLobbiesByPlayerId(playerId);
    const lobbiesWithDetails = await Promise.all(
      lobbies.map((lobby) =>
        serializeLobbyWithPlayerDetails(lobby, playerStore)
      )
    );
    res.json(lobbiesWithDetails);
  }

  async function joinLobby(req: Request, res: Response) {
    const validationResult = joinLobbySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.issues,
      });
    }

    const { playerId, side } = validationResult.data;
    const player: PlayerType = {
      id: playerId,
      name: "?",
      skillLevel: "A1",
      supabaseId: playerId,
      email: "unknown@example.com",
    };
    const lobby = await useCases.joinLobby(req.params.id, player, side);
    res.json(serializeLobby(lobby));
  }

  async function leaveLobby(req: Request, res: Response) {
    const validationResult = leaveLobbySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.issues,
      });
    }

    const { playerId } = validationResult.data;
    const player: PlayerType = {
      id: playerId,
      name: "?",
      skillLevel: "A1",
      supabaseId: playerId,
      email: "unknown@example.com",
    };
    const lobby = await useCases.leaveLobby(req.params.id, player);
    res.json(serializeLobby(lobby));
  }

  async function deleteLobby(req: Request, res: Response) {
    try {
      await useCases.deleteLobby(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "Lobby not found") {
        return res.status(404).json({ error: "Lobby not found" });
      }
      throw error;
    }
  }

  //MARK: Routes
  router.post("/", createLobby);
  router.get("/:id", getLobbyById);
  router.get("/", listLobbies);
  router.get("/player/:playerId", getLobbiesByPlayer);
  router.post("/:id/join", joinLobby);
  router.post("/:id/leave", leaveLobby);
  router.delete("/:id", deleteLobby);

  return router;
}
