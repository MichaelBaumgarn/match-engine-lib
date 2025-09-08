export interface DatabaseHealth {
  status: "connected" | "disconnected" | "error";
  details: {
    version?: string;
    connectionPoolSize?: string | number;
    error?: string;
    code?: string;
  } | null;
}

export interface AppHealth {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  database: DatabaseHealth;
  uptime: number;
}

export interface ReadinessCheck {
  status: "ready" | "not ready";
  message?: string;
  timestamp: string;
}

export interface LivenessCheck {
  status: "alive";
  timestamp: string;
  uptime: number;
}