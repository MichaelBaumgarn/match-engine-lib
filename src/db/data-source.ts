import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ClubEntity } from "../entities/ClubEntity";

// Railway automatically provides these environment variables when you add a PostgreSQL service
const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, DATABASE_URL } =
  process.env;

// Construct database configuration
const dbConfig = {
  type: "postgres" as const,
  host: PGHOST || process.env.DB_HOST || "localhost",
  port: parseInt(PGPORT || process.env.DB_PORT || "54323"),
  username: PGUSER || process.env.DB_USERNAME || "postgres",
  password: PGPASSWORD || process.env.DB_PASSWORD || "postgres",
  database: PGDATABASE || process.env.DB_NAME || "match-store",
  // synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity],
  namingStrategy: new SnakeNamingStrategy(),
};

// Log database configuration (without sensitive data)
console.log("Database configuration:");
console.log("- Host:", dbConfig.host);
console.log("- Port:", dbConfig.port);
console.log("- Database:", dbConfig.database);
console.log("- Username:", dbConfig.username);
console.log("- Synchronize:", dbConfig.synchronize);
console.log("- Logging:", dbConfig.logging);

export const AppDataSource = new DataSource(dbConfig);
