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

console.log(
  "Running migrations with database URL:",
  databaseUrl.replace(/:[^:@]*@/, ":****@")
);

try {
  // Run migrations using go migrate CLI
  execSync(`migrate -database "${databaseUrl}" -path migrations up`, {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });

  console.log("✅ Migrations completed successfully");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}
