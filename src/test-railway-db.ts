import { AppDataSource } from "./db/data-source";

console.log("🔍 Testing Railway database connection locally...");

// Set Railway environment variables for testing
process.env.PGHOST = "match-engine-lib.railway.internal";
process.env.PGPORT = "5432";
process.env.PGUSER = "postgres";
process.env.PGPASSWORD = "yKlwpcPKOLXSjPGPGtqymLcPGmGjtXdG";
process.env.PGDATABASE = "railway";
process.env.DATABASE_URL =
  "postgresql://postgres:yKlwpcPKOLXSjPGPGtqymLcPGmGjtXdG@match-engine-lib.railway.internal:5432/railway";
process.env.NODE_ENV = "production";

console.log("🔧 Set Railway environment variables:");
console.log("- PGHOST:", process.env.PGHOST);
console.log("- PGPORT:", process.env.PGPORT);
console.log("- PGUSER:", process.env.PGUSER);
console.log("- PGPASSWORD:", process.env.PGPASSWORD ? "set" : "not set");
console.log("- PGDATABASE:", process.env.PGDATABASE);
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "set" : "not set");
console.log("- NODE_ENV:", process.env.NODE_ENV);

async function testRailwayDatabaseConnection() {
  try {
    console.log("📡 Attempting to connect to Railway database...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Railway database connection successful!");

      // Test a simple query
      const result = await AppDataSource.query("SELECT version()");
      console.log("✅ Railway database query successful:", result[0]);

      // Test a few more queries to verify full connectivity
      const tablesResult = await AppDataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log(
        "✅ Database tables:",
        tablesResult.map((r: any) => r.table_name)
      );

      await AppDataSource.destroy();
      console.log("✅ Railway database connection closed");
    } else {
      console.log("✅ Railway database already connected");
    }
  } catch (error: any) {
    console.error("❌ Railway database connection failed:", error);
    console.error("❌ Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port,
    });

    // Additional debugging information
    console.error("🔍 Connection troubleshooting:");
    console.error("- Host:", process.env.PGHOST);
    console.error("- Port:", process.env.PGPORT);
    console.error("- Database:", process.env.PGDATABASE);
    console.error("- SSL enabled:", process.env.NODE_ENV === "production");
  }
}

// Run the test
testRailwayDatabaseConnection()
  .then(() => {
    console.log("🏁 Railway database test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Railway database test failed:", error);
    process.exit(1);
  });
