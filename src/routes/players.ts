import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { DbPlayerStore } from "../store/DbPlayerStore";
import { DbClubStore } from "../store/DbClubStore";
import Player from "../models/Player";
import Club from "../models/Club";
import crypto from "crypto";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function playerRouter(ds: DataSource) {
  const router = Router();
  const store = new DbPlayerStore(ds.manager);

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const player: Player = req.body;
      await store.create(player);
      res.status(201).json(player);
    })
  );

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const players = await store.list();
      res.json(players);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const player = await store.getById(req.params.id);
      if (!player) return res.status(404).json({ error: "Not found" });
      res.json(player);
    })
  );

  router.put(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const player: Player = { ...req.body, id: req.params.id };
      await store.update(player);
      res.json(player);
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      await store.delete(req.params.id);
      res.status(204).send();
    })
  );

  // Supabase integration endpoints
  router.get(
    "/supabase/:supabaseId",
    asyncHandler(async (req: Request, res: Response) => {
      const player = await store.getBySupabaseId(req.params.supabaseId);
      if (!player) return res.status(404).json({ error: "Player not found" });
      res.json(player);
    })
  );

  router.post(
    "/supabase",
    asyncHandler(async (req: Request, res: Response) => {
      const { supabaseId, email, name, ...otherFields } = req.body;

      // First, try to find existing player by Supabase ID
      let player = await store.getBySupabaseId(supabaseId);

      if (player) {
        // Update existing player with latest Supabase data
        const updatedPlayer = {
          ...player,
          email: email || player.email,
          ...otherFields,
        };
        await store.update(updatedPlayer);
        res.json(updatedPlayer);
      } else {
        // Create new player
        const newPlayer: Player = {
          id: crypto.randomUUID(),
          name: name || email || `Player_${supabaseId.slice(0, 8)}`,
          supabaseId,
          email,
          ...otherFields,
        };
        await store.create(newPlayer);
        res.status(201).json(newPlayer);
      }
    })
  );

  return router;
}
