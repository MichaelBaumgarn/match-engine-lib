import { Player } from "./DbPlayerStore";

export interface PlayerStore {
  create(player: Player): Promise<void>;
  getById(id: string): Promise<Player | null>;
  update(player: Player): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<Player[]>;
}
