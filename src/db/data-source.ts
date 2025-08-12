import { DataSource } from "typeorm";

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
