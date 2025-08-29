import express from "express";
import cors from "cors";
import { AppDataSource } from "./db/data-source";
import lobbiesRouter from "./routes/lobbies";
import { clubRouter } from "./routes/clubs";
import { playerRouter } from "./routes/players";

export async function createApp() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);

    // Log request body for POST/PUT requests
    if (
      ["POST", "PUT", "PATCH"].includes(req.method) &&
      req.body &&
      Object.keys(req.body).length > 0
    ) {
      console.log(
        `[${timestamp}] Request Body:`,
        JSON.stringify(req.body, null, 2)
      );
    }

    // Log response status
    const originalSend = res.send;
    res.send = function (data) {
      console.log(`[${timestamp}] Response Status: ${res.statusCode}`);
      if (res.statusCode >= 400) {
        console.log(`[${timestamp}] Error Response:`, data);
      }
      return originalSend.call(this, data);
    };

    next();
  });

  app.use("/lobbies", lobbiesRouter(AppDataSource));
  app.use("/players", playerRouter(AppDataSource));
  app.use("/clubs", clubRouter(AppDataSource));

  // Global error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      const status = err.statusCode || err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ error: message });
    }
  );

  return app;
}

// If you want a standalone server:
if (require.main === module) {
  createApp().then((app) => {
    const port = process.env.PORT ?? 8080;
    app.listen(port, () => console.log(`HTTP listening on :${port}`));
  });
}
