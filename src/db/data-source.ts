import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ClubEntity } from "../entities/ClubEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "54323"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "match-store",
  // synchronize: process.env.NODE_ENV === "development", // Only sync in development
  logging: process.env.NODE_ENV === "development",
  entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity],
  namingStrategy: new SnakeNamingStrategy(),
});
