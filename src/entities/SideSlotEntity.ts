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

  @Column({ type: "integer" })
  playerId!: number;

  @Column({ type: "text" })
  side!: "left" | "right";

  @Column({ type: "integer" })
  lobbyId!: number;

  @ManyToOne(() => LobbyEntity, (lobby) => lobby.sideSlots)
  @JoinColumn({ name: "lobbyId" })
  lobby!: LobbyEntity;
}
