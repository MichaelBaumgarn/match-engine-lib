import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { DbPlayerStore } from "../store/DbPlayerStore";
import { DbClubStore } from "../store/DbClubStore";
import { validateBody } from "../middleware/validation";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  SupabasePlayerSchema,
  type CreatePlayer,
  type UpdatePlayer,
  type SupabasePlayer,
} from "../schemas/player";
import crypto from "crypto";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function playerRouter(ds: DataSource) {
  const router = Router();
  const store = new DbPlayerStore(ds.manager);

  router.post(
    "/",
    validateBody(CreatePlayerSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const playerData: CreatePlayer = req.body;
      const player = {
        ...playerData,
        id: crypto.randomUUID(),
      };
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
    validateBody(UpdatePlayerSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const playerData: UpdatePlayer = req.body;

      // Get existing player to merge with updates
      const existingPlayer = await store.getById(req.params.id);
      if (!existingPlayer) {
        return res.status(404).json({ error: "Player not found" });
      }

      // Merge existing data with updates
      const updatedPlayer = {
        ...existingPlayer,
        ...playerData,
        id: req.params.id,
      };

      await store.update(updatedPlayer);
      res.json(updatedPlayer);
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
    validateBody(SupabasePlayerSchema),
    asyncHandler(async (req: Request, res: Response) => {
      const playerData: SupabasePlayer = req.body;
      const { supabaseId, email, name, skillLevel, profilePicture, city } =
        playerData;

      // First, try to find existing player by Supabase ID
      let player = await store.getBySupabaseId(supabaseId);

      if (player) {
        // Update existing player with latest Supabase data
        const updatedPlayer = {
          ...player,
          email: email || player.email,
          name: name || player.name,
          skillLevel: skillLevel || player.skillLevel,
          profilePicture: profilePicture ?? player.profilePicture,
          city: city || player.city,
        };
        await store.update(updatedPlayer);
        res.json(updatedPlayer);
      } else {
        // Create new player
        const newPlayer = {
          id: crypto.randomUUID(),
          name: name || email || `Player_${supabaseId.slice(0, 8)}`,
          supabaseId,
          email: email,
          skillLevel: skillLevel || "A1",
          profilePicture: profilePicture ?? null,
          city: city || null,
        };
        await store.create(newPlayer);
        res.status(201).json(newPlayer);
      }
    })
  );

  return router;
}
