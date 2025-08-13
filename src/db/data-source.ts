import { DataSource } from "typeorm";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 54323,
  username: "postgres",
  password: "postgres",
  database: "match-store",
  synchronize: false, // ⚠️ use only for dev
  logging: false,
  entities: [LobbyEntity, SideSlotEntity],
});
