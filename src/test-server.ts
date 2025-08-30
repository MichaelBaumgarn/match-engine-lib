import express from "express";
import cors from "cors";

console.log("🚀 Starting Test Server...");

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  console.log("Health check requested");
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Test server is running",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Test Server is running",
    timestamp: new Date().toISOString(),
    version: "test-1.0.0",
  });
});

const port = process.env.PORT ?? 8080;
const server = app.listen(port, () => {
  console.log(`✅ Test server listening on port ${port}`);
  console.log(`✅ Health check available at http://localhost:${port}/health`);
  console.log(`✅ Server ready at http://localhost:${port}`);
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
