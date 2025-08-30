#!/usr/bin/env node

const { execSync } = require("child_process");

// Railway automatically injects these environment variables when you add a PostgreSQL service
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DATABASE_URL } =
  process.env;

// Construct DATABASE_URL if not provided by Railway
const databaseUrl =
  DATABASE_URL ||
  `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;

// Check if we have valid database credentials
if (!DATABASE_URL && (!PGHOST || !PGUSER || !PGPASSWORD || !PGDATABASE)) {
  console.log(
    "⚠️  No database credentials found. Skipping migrations (this is normal for local development)."
  );
  console.log("   Migrations will run automatically on Railway deployment.");
  process.exit(0);
}

console.log("🔍 Debug Info:");
console.log("- Current PATH:", process.env.PATH);
console.log("- GOPATH:", process.env.GOPATH);
console.log("- Working directory:", process.cwd());

// Try to find migrate binary
let migratePath = "migrate"; // default
try {
  migratePath = require("child_process")
    .execSync("which migrate", { encoding: "utf8" })
    .trim();
  console.log("- Migrate command found at:", migratePath);
} catch (error) {
  // If not in PATH, try common locations
  const commonPaths = [
    "/root/go/bin/migrate",
    "/usr/local/bin/migrate",
    "/usr/bin/migrate",
  ];

  for (const path of commonPaths) {
    try {
      require("child_process").execSync(`test -f ${path}`, { stdio: "ignore" });
      migratePath = path;
      console.log("- Migrate binary found at:", migratePath);
      break;
    } catch (e) {
      // continue to next path
    }
  }

  if (migratePath === "migrate") {
    console.log("- Migrate binary not found in common locations");
  }
}

console.log(
  "Running migrations with database URL:",
  databaseUrl.replace(/:[^:@]*@/, ":****@")
);

try {
  // Run migrations using go migrate CLI with full path
  console.log(`🚀 Running: ${migratePath} -database "***" -path migrations up`);
  execSync(`${migratePath} -database "${databaseUrl}" -path migrations up`, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  console.log("✅ Migrations completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  console.error("Full error details:", error);
  if (error.stdout) console.error("STDOUT:", error.stdout.toString());
  if (error.stderr) console.error("STDERR:", error.stderr.toString());
  process.exit(1);
}
