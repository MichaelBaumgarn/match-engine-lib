import { Router, Request, Response } from "express";
import { DataSource } from "typeorm";
import { HealthService } from "@/core";

export function healthRouter(ds: DataSource) {
  const router = Router();
  const healthService = new HealthService(ds);

  async function getHealthStatus(_req: Request, res: Response) {
    const healthData = await healthService.getHealth();
    const statusCode = healthData.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthData);
  }

  async function getReadinessStatus(_req: Request, res: Response) {
    const readiness = await healthService.getReadiness();
    const statusCode = readiness.status === "ready" ? 200 : 503;
    res.status(statusCode).json(readiness);
  }

  async function getLivenessStatus(_req: Request, res: Response) {
    const liveness = healthService.getLiveness();
    res.json(liveness);
  }


  async function getActuatorHealth(_req: Request, res: Response) {
    const healthData = await healthService.getHealth();
    const statusCode = healthData.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthData);
  }


  router.get("/", getHealthStatus);
  router.get("/ready", getReadinessStatus);
  router.get("/live", getLivenessStatus);
  router.get("/actuator/health", getActuatorHealth);

  return router;
}