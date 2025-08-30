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

// Try multiple possible locations for the migrate binary
const possibleMigratePaths = [
  "/root/go/bin/migrate",
  "/usr/local/bin/migrate",
  "/usr/bin/migrate",
  "migrate", // fallback to PATH
];

let migratePath = null;
for (const path of possibleMigratePaths) {
  try {
    if (path === "migrate") {
      // Try to find migrate in PATH
      const whichResult = execSync("which migrate", {
        encoding: "utf8",
      }).trim();
      console.log("- Found migrate in PATH at:", whichResult);
      migratePath = whichResult;
      break;
    } else {
      // Check if file exists and is executable
      require("child_process").execSync(`test -x ${path}`, {
        stdio: "ignore",
      });
      console.log("- Found migrate binary at:", path);
      migratePath = path;
      break;
    }
  } catch (error) {
    console.log("- Migrate not found at:", path);
  }
}

if (!migratePath) {
  console.error("- ERROR: Could not find migrate binary in any location");
  console.error("- Trying to list /root/go/bin contents:");
  try {
    const lsResult = execSync("ls -la /root/go/bin/", { encoding: "utf8" });
    console.error("- /root/go/bin contents:", lsResult);
  } catch (error) {
    console.error("- Could not list /root/go/bin:", error.message);
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
