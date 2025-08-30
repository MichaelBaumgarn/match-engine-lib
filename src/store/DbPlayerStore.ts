import { EntityManager, In } from "typeorm";
import { PlayerEntity } from "../entities/PlayerEntity";

export interface Player {
  id: string;
  name: string;
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  profilePicture?: string | null;
  supabaseId: string;
  email: string;
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

  async getBySupabaseId(supabaseId: string): Promise<Player | null> {
    const repo = this.manager.getRepository(PlayerEntity);
    const entity = await repo.findOneBy({ supabaseId });
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

  async getPlayersByIds(playerIds: string[]): Promise<Player[]> {
    if (playerIds.length === 0) return [];

    const repo = this.manager.getRepository(PlayerEntity);
    const players = await repo.find({
      where: { id: In(playerIds) },
    });

    return players.map(entityToPlayer);
  }
}

function entityToPlayer(entity: PlayerEntity): Player {
  return {
    id: entity.id,
    name: entity.name,
    skillLevel:
      (entity.skillLevel as
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert") ?? "beginner",
    profilePicture: entity.profilePicture ?? null,
    supabaseId: entity.supabaseId ?? "",
    email: entity.email ?? "",
  };
}

function playerToEntity(player: Player): PlayerEntity {
  const entity = new PlayerEntity();
  entity.id = player.id;
  entity.name = player.name;
  entity.skillLevel = player.skillLevel;
  entity.profilePicture = player.profilePicture ?? undefined;
  entity.supabaseId = player.supabaseId;
  entity.email = player.email;
  return entity;
}
