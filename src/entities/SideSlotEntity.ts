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

  @Column({ type: "uuid" })
  playerId!: string;

  @Column({ type: "text" })
  side!: "left" | "right";

  @Column({ type: "uuid" })
  lobbyId!: string;

  @ManyToOne(() => LobbyEntity, (lobby) => lobby.sideSlots)
  @JoinColumn({ name: "lobby_id" })
  lobby!: LobbyEntity;
}
