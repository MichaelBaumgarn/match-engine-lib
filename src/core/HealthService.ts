import { DataSource } from "typeorm";
import { DatabaseHealth, AppHealth, ReadinessCheck, LivenessCheck } from "../models/Health";

export class HealthService {
  constructor(private dataSource: DataSource) {}

  async getHealth(): Promise<AppHealth> {
    const timestamp = new Date().toISOString();
    const database = await this.getDatabaseHealth();
    
    return {
      status: database.status === "connected" ? "healthy" : "unhealthy",
      timestamp,
      version: "1.0.0",
      database,
      uptime: process.uptime()
    };
  }

  async getReadiness(): Promise<ReadinessCheck> {
    const timestamp = new Date().toISOString();
    
    if (!this.dataSource.isInitialized) {
      return {
        status: "not ready",
        message: "Database not initialized",
        timestamp
      };
    }

    try {
      await this.dataSource.query("SELECT 1");
      return {
        status: "ready",
        timestamp
      };
    } catch (error) {
      return {
        status: "not ready",
        message: "Database connection failed",
        timestamp
      };
    }
  }

  getLiveness(): LivenessCheck {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }

  private async getDatabaseHealth(): Promise<DatabaseHealth> {
    let status: DatabaseHealth["status"] = "disconnected";
    let details: DatabaseHealth["details"] = null;
    
    try {
      if (this.dataSource.isInitialized) {
        const result = await this.dataSource.query("SELECT version()");
        status = "connected";
        details = {
          version: result[0].version,
          connectionPoolSize: this.dataSource.options.extra?.max || "unknown"
        };
      }
    } catch (error: any) {
      status = "error";
      details = {
        error: error.message || String(error),
        code: error.code || "unknown"
      };
    }

    return { status, details };
  }
}