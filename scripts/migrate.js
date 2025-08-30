#!/usr/bin/env node

const { execSync } = require("child_process");

// Railway automatically injects these environment variables when you add a PostgreSQL service
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DATABASE_URL } =
  process.env;

console.log("🔍 Migration Debug Info:");
console.log("- DATABASE_URL:", DATABASE_URL ? "set" : "not set");
console.log("- PGHOST:", PGHOST ? "set" : "not set");
console.log("- PGUSER:", PGUSER ? "set" : "not set");
console.log("- PGPASSWORD:", PGPASSWORD ? "set" : "not set");
console.log("- PGDATABASE:", PGDATABASE ? "set" : "not set");

// Use DATABASE_URL if provided by Railway, otherwise construct from individual variables
let databaseUrl;
if (DATABASE_URL) {
  console.log("✅ Using Railway-provided DATABASE_URL");
  databaseUrl = DATABASE_URL;
} else if (PGHOST && PGUSER && PGPASSWORD && PGDATABASE) {
  console.log("⚠️  Using individual database variables");
  databaseUrl = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
} else {
  console.log(
    "⚠️  No database credentials found. Skipping migrations (this is normal for local development)."
  );
  console.log("   Migrations will run automatically on Railway deployment.");
  process.exit(0);
}

console.log("🔍 Additional Debug Info:");
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
  console.error("- Trying to find migrate in PATH...");
  try {
    const whichResult = execSync("which migrate", { encoding: "utf8" }).trim();
    console.log("- Found migrate at:", whichResult);
  } catch (whichError) {
    console.error("- Migrate not found in PATH either");
  }
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
