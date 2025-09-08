import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { HealthService } from "../core/HealthService";

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function healthRouter(ds: DataSource) {
  const router = Router();
  const healthService = new HealthService(ds);

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const healthData = await healthService.getHealth();
      const statusCode = healthData.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(healthData);
    })
  );

  router.get(
    "/ready",
    asyncHandler(async (_req: Request, res: Response) => {
      const readiness = await healthService.getReadiness();
      const statusCode = readiness.status === "ready" ? 200 : 503;
      res.status(statusCode).json(readiness);
    })
  );

  router.get(
    "/live",
    asyncHandler(async (_req: Request, res: Response) => {
      const liveness = healthService.getLiveness();
      res.json(liveness);
    })
  );

  router.get(
    "/actuator/health",
    asyncHandler(async (_req: Request, res: Response) => {
      const healthData = await healthService.getHealth();
      const statusCode = healthData.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(healthData);
    })
  );

  return router;
}
