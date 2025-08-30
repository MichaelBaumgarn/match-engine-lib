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

// Use the known path where migrate is installed
const migratePath = "/root/go/bin/migrate";
console.log("- Using migrate binary at:", migratePath);

// Check if migrate binary exists and is executable
try {
  require("child_process").execSync(`test -x ${migratePath}`, {
    stdio: "ignore",
  });
  console.log("- Migrate binary is executable");
} catch (error) {
  console.error("- ERROR: Migrate binary is not executable or doesn't exist");
  process.exit(1);
}

// Check if migrations directory exists
try {
  require("child_process").execSync(`test -d migrations`, { stdio: "ignore" });
  console.log("- Migrations directory exists");
} catch (error) {
  console.error("- ERROR: Migrations directory not found");
  process.exit(1);
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
