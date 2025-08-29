import { EntityManager } from "typeorm";
import LobbyService, { LobbyStatusEnum } from "../core/LobbyService";
import { LobbyEntity } from "../entities/LobbyEntity";
import { SideSlotEntity } from "../entities/SideSlotEntity";

export class DbLobbyStore {
  constructor(private manager: EntityManager) {}

  async saveLobby(lobby: LobbyService): Promise<void> {
    const repo = this.manager.getRepository(LobbyEntity);
    const sideSlotRepo = this.manager.getRepository(SideSlotEntity);

    // First, delete existing side slots for this lobby
    await sideSlotRepo.delete({ lobbyId: lobby.id });

    const lobbyEntity = lobbyServiceToEntity(lobby);
    await repo.save(lobbyEntity);

    // Save side slots separately
    if (lobbyEntity.sideSlots.length > 0) {
      await sideSlotRepo.save(lobbyEntity.sideSlots);
    }
  }

  async getLobby(id: string): Promise<LobbyService | null> {
    const repo = this.manager.getRepository(LobbyEntity);
    const entity = await repo.findOne({
      where: { id },
      relations: { sideSlots: true }, // or make relation eager
    });
    return entity ? entityToLobbyService(entity) : null;
  }

  async deleteLobby(id: string): Promise<void> {
    const repo = this.manager.getRepository(LobbyEntity);
    await repo.delete(id);
  }

  async listLobbies(): Promise<LobbyService[]> {
    const repo = this.manager.getRepository(LobbyEntity);
    const rows = await repo.find({ relations: { sideSlots: true } });
    return rows.map(entityToLobbyService);
  }

  async listLobbiesWithPlayerDetails(): Promise<LobbyService[]> {
    const repo = this.manager.getRepository(LobbyEntity);
    const rows = await repo.find({
      relations: {
        sideSlots: true,
      },
    });

    // For now, return the same as listLobbies since we need to implement player fetching
    // TODO: Implement proper player data fetching
    return rows.map(entityToLobbyService);
  }

  async getLobbyWithPlayerDetails(id: string): Promise<LobbyService | null> {
    const repo = this.manager.getRepository(LobbyEntity);
    const entity = await repo.findOne({
      where: { id },
      relations: { sideSlots: true },
    });
    return entity ? entityToLobbyService(entity) : null;
  }
}

function lobbyServiceToEntity(service: LobbyService): LobbyEntity {
  const entity = new LobbyEntity();
  entity.id = service.id;
  entity.createdBy = service.createdBy.id;
  entity.status = service.status;
  entity.startAt = service.startAt;
  entity.durationMinutes = service.durationMinutes;
  entity.visibility = service.visibility;
  entity.maxPlayersBySide = service.maxPlayersBySide;

  entity.sideSlots = [
    ...service.leftSideSlots.map((p) => {
      const slot = new SideSlotEntity();
      slot.playerId = p.id;
      slot.side = "left";
      slot.lobby = entity; // sets FK
      return slot;
    }),
    ...service.rightSideSlots.map((p) => {
      const slot = new SideSlotEntity();
      slot.playerId = p.id;
      slot.side = "right";
      slot.lobby = entity;
      return slot;
    }),
  ];

  return entity;
}

function entityToLobbyService(entity: LobbyEntity): LobbyService {
  // Avoid duplicating creator: rebuild arrays explicitly
  const creator = { id: entity.createdBy, name: "?" };
  const svc = new LobbyService(
    entity.id,
    creator,
    entity.startAt,
    entity.durationMinutes
  );
  svc.status = entity.status as LobbyStatusEnum;
  svc.visibility = entity.visibility;
  svc.maxPlayersBySide = entity.maxPlayersBySide;

  // reset the arrays so we don't keep the constructor's default
  svc.leftSideSlots = [];
  svc.rightSideSlots = [];

  for (const slot of entity.sideSlots || []) {
    const p = { id: slot.playerId, name: "?" };
    if (slot.side === "left") svc.leftSideSlots.push(p);
    else svc.rightSideSlots.push(p);
  }

  return svc;
}
