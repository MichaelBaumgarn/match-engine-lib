import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ClubEntity } from "../entities/ClubEntity";

// Railway automatically provides these environment variables when you add a PostgreSQL service
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DATABASE_URL } =
  process.env;

// Create database configuration based on available variables
let dbConfig: any;

// Prioritize local database for development, use Railway for production
if (process.env.NODE_ENV === "production" && DATABASE_URL) {
  console.log("✅ Using Railway-provided DATABASE_URL for production");

  dbConfig = {
    type: "postgres" as const,
    url: DATABASE_URL,
    logging: false,
    entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity],
    namingStrategy: new SnakeNamingStrategy(),
    // Add SSL configuration for Railway
    ssl: {
      rejectUnauthorized: false,
    },
    // Add connection timeout and retry settings
    connectTimeoutMS: 30000,
    extra: {
      connectionTimeoutMillis: 30000,
      query_timeout: 30000,
      statement_timeout: 30000,
      // Add connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
    },
  };

  // Log database configuration (without sensitive data)
  console.log("Database configuration (using Railway DATABASE_URL):");
  console.log("- URL: [provided by Railway]");
  console.log("- SSL:", dbConfig.ssl);
  console.log("- Logging:", dbConfig.logging);
  console.log("- Connection timeout:", dbConfig.connectTimeoutMS);
} else {
  // Use local database for development
  console.log("🖥️  Using local database for development");

  dbConfig = {
    type: "postgres" as const,
    host: PGHOST || process.env.DB_HOST || "localhost",
    port: parseInt(PGPORT || process.env.DB_PORT || "54323"),
    username: PGUSER || process.env.DB_USERNAME || "postgres",
    password: PGPASSWORD || process.env.DB_PASSWORD || "postgres",
    database: PGDATABASE || process.env.DB_NAME || "match-store",
    logging: process.env.NODE_ENV === "development" || true,
    entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity],
    namingStrategy: new SnakeNamingStrategy(),
    // No SSL for local development
    ssl: false,
    // Add connection timeout and retry settings
    connectTimeoutMS: 30000,
    extra: {
      connectionTimeoutMillis: 30000,
      query_timeout: 30000,
      statement_timeout: 30000,
      // Add connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
    },
  };

  // Log database configuration (without sensitive data)
  console.log("Database configuration (using local database):");
  console.log("- Host:", dbConfig.host);
  console.log("- Port:", dbConfig.port);
  console.log("- Database:", dbConfig.database);
  console.log("- Username:", dbConfig.username);
  console.log("- SSL:", dbConfig.ssl);
  console.log("- Logging:", dbConfig.logging);
  console.log("- Connection timeout:", dbConfig.connectTimeoutMS);

  // Log environment variables for debugging
  console.log("Environment variables:");
  console.log("- PGHOST:", PGHOST ? "set" : "not set");
  console.log("- PGPORT:", PGPORT ? "set" : "not set");
  console.log("- PGUSER:", PGUSER ? "set" : "not set");
  console.log("- PGPASSWORD:", PGPASSWORD ? "set" : "not set");
  console.log("- PGDATABASE:", PGDATABASE ? "set" : "not set");
  console.log("- DATABASE_URL:", DATABASE_URL ? "set" : "not set");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
}

export const AppDataSource = new DataSource(dbConfig);
