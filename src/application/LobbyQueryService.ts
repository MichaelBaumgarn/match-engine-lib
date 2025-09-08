import { EntityManager, SelectQueryBuilder } from "typeorm";
import { LobbyService } from "@/core";
import { LobbyEntity } from "../entities/LobbyEntity";

export interface LobbyFilters {
  status?: string;
  clubId?: string;
  createdBy?: string;
  startAfter?: Date;
  startBefore?: Date;
  availableOnly?: boolean;
}

export class LobbyQueryService {
  constructor(private manager: EntityManager) {}

  buildQuery(filters?: LobbyFilters): SelectQueryBuilder<LobbyEntity> {
    const repo = this.manager.getRepository(LobbyEntity);
    const queryBuilder = repo
      .createQueryBuilder("lobby")
      .leftJoinAndSelect("lobby.sideSlots", "sideSlot")
      .leftJoinAndSelect("lobby.club", "club");

    if (filters) {
      this.applyFilters(queryBuilder, filters);
    }

    return queryBuilder.orderBy("lobby.startAt", "ASC");
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<LobbyEntity>, filters: LobbyFilters): void {
    if (filters.status) {
      queryBuilder.andWhere("lobby.status = :status", { status: filters.status });
    }

    if (filters.clubId) {
      queryBuilder.andWhere("lobby.club_id = :clubId", { clubId: filters.clubId });
    }

    if (filters.createdBy) {
      queryBuilder.andWhere("lobby.createdBy = :createdBy", { createdBy: filters.createdBy });
    }

    if (filters.startAfter) {
      queryBuilder.andWhere("lobby.startAt > :startAfter", { startAfter: filters.startAfter });
    }

    if (filters.startBefore) {
      queryBuilder.andWhere("lobby.startAt < :startBefore", { startBefore: filters.startBefore });
    }

    if (filters.availableOnly) {
      this.applyAvailabilityFilter(queryBuilder);
    }
  }

  private applyAvailabilityFilter(queryBuilder: SelectQueryBuilder<LobbyEntity>): void {
    queryBuilder
      .addSelect("COUNT(CASE WHEN sideSlot.side = 'left' THEN 1 END)", "leftCount")
      .addSelect("COUNT(CASE WHEN sideSlot.side = 'right' THEN 1 END)", "rightCount")
      .groupBy("lobby.id")
      .addGroupBy("club.id")
      .having("COUNT(CASE WHEN sideSlot.side = 'left' THEN 1 END) < lobby.maxPlayersBySide")
      .orHaving("COUNT(CASE WHEN sideSlot.side = 'right' THEN 1 END) < lobby.maxPlayersBySide");
  }

  static filterInMemoryLobbies(lobbies: LobbyService[], filters: LobbyFilters): LobbyService[] {
    let filtered = [...lobbies];

    if (filters.status) {
      filtered = filtered.filter(lobby => lobby.status === filters.status);
    }

    if (filters.clubId) {
      filtered = filtered.filter(lobby => lobby.club?.id === filters.clubId);
    }

    if (filters.createdBy) {
      filtered = filtered.filter(lobby => lobby.createdBy.id === filters.createdBy);
    }

    if (filters.startAfter) {
      filtered = filtered.filter(lobby => lobby.startAt > filters.startAfter!);
    }

    if (filters.startBefore) {
      filtered = filtered.filter(lobby => lobby.startAt < filters.startBefore!);
    }

    if (filters.availableOnly) {
      filtered = filtered.filter(lobby => 
        lobby.leftSideSlots.length < lobby.maxPlayersBySide || 
        lobby.rightSideSlots.length < lobby.maxPlayersBySide
      );
    }

    return filtered.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }
}