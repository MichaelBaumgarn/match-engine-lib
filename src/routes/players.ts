import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { DbPlayerStore } from "../store/DbPlayerStore";
import { DbClubStore } from "../store/DbClubStore";
import Player from "../models/Player";
import Club from "../models/Club";

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

  return router;
}
