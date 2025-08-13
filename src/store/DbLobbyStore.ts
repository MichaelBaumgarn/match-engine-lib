import LobbyService from "../core/LobbyService";
import { AppDataSource } from "../db/data-source";
import { LobbyEntity } from "../entities/LobbyEntity";
import { LobbyStore } from "./LobbyStore";

export class DbLobbyStore implements LobbyStore {
  async saveLobby(lobby: LobbyService): Promise<void> {
    const repo = AppDataSource.getRepository(LobbyEntity);
    let lobbyEntity = lobbyServiceToEntity(lobby);
    repo.save(lobbyEntity);
  }

  async getLobby(id: number): Promise<LobbyService | null> {
    const repo = AppDataSource.getRepository(LobbyEntity);
    const entity = await repo.findOne({ where: { id } });
    if (!entity) return null;

    return entityToLobbyService(entity);
  }

  async deleteLobby(id: number): Promise<void> {
    const repo = AppDataSource.getRepository(LobbyEntity);
    repo.delete(id);
  }

  async listLobbies(): Promise<LobbyService[]> {
    const repo = AppDataSource.getRepository(LobbyEntity);

    const res = repo.find();
    return (await res).map((r) => entityToLobbyService(r));
  }
}

function lobbyServiceToEntity(lobby: LobbyService) {
  return Object.assign(new LobbyEntity(), lobby);
}

function entityToLobbyService(entity: LobbyEntity) {
  return Object.assign(
    new LobbyService(entity.id, { id: entity.createdBy, name: "?" }),
    entity
  );
}
