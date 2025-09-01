import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { LobbyEntity } from "./LobbyEntity";

@Entity("side_slots")
export class SideSlotEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid", name: "player_id" })
  playerId!: string;

  @Column({ type: "text", name: "side" })
  side!: "left" | "right";

  @Column({ type: "uuid", name: "lobby_id" })
  lobbyId!: string;

  @ManyToOne(() => LobbyEntity, (lobby) => lobby.sideSlots)
  @JoinColumn({ name: "lobby_id" })
  lobby!: LobbyEntity;
}
