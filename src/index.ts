import express from "express";
import cors from "cors";
import { AppDataSource } from "./db/data-source";
import lobbiesRouter from "./routes/lobbies";

export async function createApp() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/lobbies", lobbiesRouter(AppDataSource));

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
    const port = process.env.PORT ?? 3000;
    app.listen(port, () => console.log(`HTTP listening on :${port}`));
  });
}
