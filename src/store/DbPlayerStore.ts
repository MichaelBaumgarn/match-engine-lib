import { EntityManager } from "typeorm";
import { PlayerEntity } from "../entities/PlayerEntity";

export interface Player {
  id: string;
  name: string;
  skillLevel?: string | null;
  profilePicture?: string | null;
}

export class DbPlayerStore {
  constructor(private manager: EntityManager) {}

  async create(player: Player): Promise<void> {
    const repo = this.manager.getRepository(PlayerEntity);
    const playerEntity = playerToEntity(player);
    await repo.save(playerEntity);
  }

  async getById(id: string): Promise<Player | null> {
    const repo = this.manager.getRepository(PlayerEntity);
    const entity = await repo.findOneBy({ id });
    return entity ? entityToPlayer(entity) : null;
  }

  async update(player: Player): Promise<void> {
    const repo = this.manager.getRepository(PlayerEntity);
    const entity = playerToEntity(player);
    await repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    const repo = this.manager.getRepository(PlayerEntity);
    await repo.delete(id);
  }

  async list(): Promise<Player[]> {
    const repo = this.manager.getRepository(PlayerEntity);
    const all = await repo.find();
    return all.map(entityToPlayer);
  }
}

function entityToPlayer(entity: PlayerEntity): Player {
  return {
    id: entity.id,
    name: entity.name,
    skillLevel: entity.skillLevel ?? null,
    profilePicture: entity.profilePicture ?? null,
  };
}

function playerToEntity(player: Player): PlayerEntity {
  const entity = new PlayerEntity();
  entity.id = player.id;
  entity.name = player.name;
  entity.skillLevel = player.skillLevel ?? undefined;
  entity.profilePicture = player.profilePicture ?? undefined;
  return entity;
}
