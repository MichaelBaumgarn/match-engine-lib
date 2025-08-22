import { Club } from "./DbClubStore";

export interface ClubStore {
  create(club: Club): Promise<void>;
  getById(id: string): Promise<Club | null>;
  update(club: Club): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Club[]>;
}
