import { DataSource } from "typeorm";
import { LobbyEntity } from "../entities/LobbyEntity";
import { PlayerEntity } from "../entities/PlayerEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";

export const TestDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 54323,
  username: "postgres",
  password: "postgres",
  database: "match-store",
  synchronize: true, // only for test DB
  dropSchema: true, // clears tables between test runs
  entities: [LobbyEntity, PlayerEntity, SideSlotEntity], // ✅ add all here
  logging: false,
});
