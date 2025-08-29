import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { ClubEntity } from "../entities/ClubEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 54323,
  username: "postgres",
  password: "postgres",
  database: "match-store",
  synchronize: false, // ⚠️ use only for dev
  logging: false,
  entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity], // ✅ add all here
  namingStrategy: new SnakeNamingStrategy(),
});
