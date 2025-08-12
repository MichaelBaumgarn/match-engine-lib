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

  @Column()
  playerId!: number;

  @Column()
  side!: "left" | "right";

  @Column()
  lobbyId!: number;

  @ManyToOne(() => LobbyEntity, (lobby) => lobby.sideSlots)
  @JoinColumn({ name: "lobbyId" })
  lobby!: LobbyEntity;
}
