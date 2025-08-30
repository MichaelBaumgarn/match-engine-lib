import { AppDataSource } from "./db/data-source";

console.log("🔍 Testing database connection...");

async function testDatabaseConnection() {
  try {
    console.log("📡 Attempting to connect to database...");

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection successful!");

      // Test a simple query
      const result = await AppDataSource.query("SELECT version()");
      console.log("✅ Database query successful:", result[0]);

      await AppDataSource.destroy();
      console.log("✅ Database connection closed");
    } else {
      console.log("✅ Database already connected");
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
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log("🏁 Database test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database test failed:", error);
    process.exit(1);
  });
