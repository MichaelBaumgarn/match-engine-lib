import express from "express";
import cors from "cors";
import { AppDataSource } from "./db/data-source";
import { lobbiesRouter, clubRouter, playerRouter, healthRouter } from "@/routes";

export async function createApp() {
  // Debug environment variables (without sensitive data)
  console.log("Environment check:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- PGHOST:", process.env.PGHOST ? "set" : "not set");
  console.log("- PGUSER:", process.env.PGUSER ? "set" : "not set");
  console.log("- PGDATABASE:", process.env.PGDATABASE ? "set" : "not set");
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
  console.log("- PORT:", process.env.PORT || "8080");

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    // Skip logging for health check endpoints to reduce noise
    if (req.path.includes('/health') || req.path.includes('/actuator/health')) {
      return next();
    }

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

  // Root endpoint for basic connectivity test
  app.get("/", (req, res) => {
    res.json({
      message: "Match Engine API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  app.use("/health", healthRouter(AppDataSource));
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
      console.error("Global error handler caught:", err);
      const status = err.statusCode || err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ error: message });
    }
  );

  return app;
}

// If you want a standalone server:
if (require.main === module) {
  console.log("🚀 Starting Match Engine API...");

  createApp()
    .then(async (app) => {
      console.log("✅ App created successfully");

      // Try to initialize database connection
      try {
        console.log("🔌 Attempting to connect to database...");
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
          console.log("✅ Database connection established");

          // Test the connection with a simple query
          try {
            const result = await AppDataSource.query("SELECT version()");
            console.log(
              "✅ Database query test successful:",
              result[0].version
            );
          } catch (queryError) {
            console.error("⚠️  Database query test failed:", queryError);
          }
        } else {
          console.log("✅ Database already connected");
        }
      } catch (error: any) {
        console.error("❌ Database connection failed:", error);
        console.error("❌ Connection error details:", {
          message: error.message,
          code: error.code,
          errno: error.errno,
          syscall: error.syscall,
          address: error.address,
          port: error.port,
        });
        console.log("⚠️  Continuing without database connection...");
      }

      const port = process.env.PORT ?? 8080;
      const server = app.listen(port, () => {
        console.log(`✅ HTTP server listening on port ${port}`);
        console.log(
          `✅ Health check available at http://localhost:${port}/health`
        );
        console.log(`✅ API ready at http://localhost:${port}`);
      });

      // Handle server errors
      server.on("error", (error) => {
        console.error("❌ Server error:", error);
        process.exit(1);
      });

      // Handle graceful shutdown
      process.on("SIGTERM", () => {
        console.log("🛑 Received SIGTERM, shutting down gracefully...");
        server.close(() => {
          console.log("✅ Server closed");
          process.exit(0);
        });
      });

      process.on("SIGINT", () => {
        console.log("🛑 Received SIGINT, shutting down gracefully...");
        server.close(() => {
          console.log("✅ Server closed");
          process.exit(0);
        });
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start application:", error);
      process.exit(1);
    });
}
