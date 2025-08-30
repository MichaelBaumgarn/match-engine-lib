import { AppDataSource } from "./db/data-source";
import express from "express";
import cors from "cors";
import lobbiesRouter from "./routes/lobbies";
import { clubRouter } from "./routes/clubs";
import { playerRouter } from "./routes/players";

console.log("🚀 Starting Match Engine API with database test...");

async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...");
    console.log("📡 Attempting to connect to database...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection successful!");

      // Test a simple query
      const result = await AppDataSource.query("SELECT version()");
      console.log("✅ Database query successful:", result[0]);
      return true;
    } else {
      console.log("✅ Database already connected");
      return true;
    }
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
    });
    return false;
  }
}

async function createApp() {
  console.log("🔧 Creating Express application...");

  // Debug environment variables (without sensitive data)
  console.log("Environment check:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- PGHOST:", process.env.PGHOST ? "set" : "not set");
  console.log("- PGUSER:", process.env.PGUSER ? "set" : "not set");
  console.log("- PGDATABASE:", process.env.PGDATABASE ? "set" : "not set");
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
  console.log("- PORT:", process.env.PORT || "8080");

  const app = express();
  console.log("✅ Express app created");

  app.use(cors());
  app.use(express.json());
  console.log("✅ Middleware configured");

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

  // Health check endpoint
  app.get("/health", (req, res) => {
    console.log("Health check requested");
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: AppDataSource.isInitialized ? "connected" : "disconnected",
    });
  });

  // Root endpoint for basic connectivity test
  app.get("/", (req, res) => {
    res.json({
      message: "Match Engine API is running",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  });

  console.log("✅ Routes configured");
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

  console.log("✅ Error handler configured");
  return app;
}

async function startServer() {
  try {
    console.log("📁 Current working directory:", process.cwd());
    console.log("📦 Node version:", process.version);
    console.log("🔧 Platform:", process.platform);

    const app = await createApp();
    console.log("✅ App created successfully");

    const port = process.env.PORT ?? 8080;
    console.log(`🌐 Attempting to start server on port ${port}...`);

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
      console.error("❌ Error message:", error.message);
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

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      process.exit(1);
    });
  } catch (error: any) {
    console.error("❌ Failed to start application:", error);
    console.error("❌ Error stack:", error.stack);
    process.exit(1);
  }
}

// Main startup sequence
async function main() {
  // Test database connection first
  const dbConnected = await testDatabaseConnection();

  if (dbConnected) {
    console.log("🎉 Database connection successful! Starting server...");
  } else {
    console.log(
      "⚠️  Database connection failed, but continuing with server startup..."
    );
  }

  // Start the server regardless of database connection
  await startServer();
}

// Run the main function
main().catch((error) => {
  console.error("💥 Startup failed:", error);
  process.exit(1);
});
