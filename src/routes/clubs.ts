import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { DbClubStore } from "../store/DbClubStore";
import Club from "../models/Club";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function clubRouter(ds: DataSource) {
  const router = Router();
  const store = new DbClubStore(ds.manager);

  router.post(
    "/",
    asyncHandler(async (req: Request, res: Response) => {
      const club: Club = req.body;
      await store.create(club);
      res.status(201).json(club);
    })
  );

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const clubs = await store.list();
      res.json(clubs);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const club = await store.getById(req.params.id);
      if (!club) return res.status(404).json({ error: "Not found" });
      res.json(club);
    })
  );

  router.put(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const club: Club = { ...req.body, id: req.params.id };
      await store.update(club);
      res.json(club);
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
