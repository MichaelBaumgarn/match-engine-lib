import { AppDataSource } from "./db/data-source";
import "reflect-metadata";

AppDataSource.initialize().then(() => {
  console.log("Data Source has been initialized!");
});
