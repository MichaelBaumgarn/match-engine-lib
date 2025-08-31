import { DataSource } from "typeorm";
import { LobbyEntity } from "../entities/LobbyEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";
import { ClubEntity } from "../entities/ClubEntity";

export const TestDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 54323,
  username: "postgres",
  password: "postgres",
  database: "match-store",
  synchronize: true, // re-enabled now that entity mapping is fixed
  dropSchema: true, // re-enabled for clean test runs
  entities: [LobbyEntity, PlayerEntity, SideSlotEntity, ClubEntity], // ✅ add all here
  logging: false,
});
