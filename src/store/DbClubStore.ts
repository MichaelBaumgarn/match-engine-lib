import { EntityManager } from "typeorm";
import { ClubEntity } from "../entities/ClubEntity";

export interface Club {
  id: string;
  name: string;
  address: string;
  city: string;
  slug?: string | null;
}

export class DbClubStore {
  constructor(private manager: EntityManager) {}

  async create(club: Club): Promise<void> {
    const repo = this.manager.getRepository(ClubEntity);
    const entity = clubToEntity(club);
    await repo.save(repo.create(entity));
  }

  async getById(id: string): Promise<Club | null> {
    const repo = this.manager.getRepository(ClubEntity);
    const entity = await repo.findOneBy({ id });
    return entity ? entityToClub(entity) : null;
  }

  async update(club: Club): Promise<void> {
    const repo = this.manager.getRepository(ClubEntity);
    await repo.save(clubToEntity(club));
  }

  async delete(id: string): Promise<void> {
    const repo = this.manager.getRepository(ClubEntity);
    await repo.delete(id);
  }

  async list(): Promise<Club[]> {
    const repo = this.manager.getRepository(ClubEntity);
    const all = await repo.find();
    return all.map(entityToClub);
  }
}

function clubToEntity(club: Club): ClubEntity {
  const entity = new ClubEntity();
  entity.id = club.id;
  entity.name = club.name;
  entity.address = club.address;
  entity.city = club.city;
  entity.slug = club.slug ?? undefined;
  return entity;
}

function entityToClub(entity: ClubEntity): Club {
  return {
    id: entity.id,
    name: entity.name,
    address: entity.address,
    city: entity.city,
    slug: entity.slug ?? null,
  };
}
