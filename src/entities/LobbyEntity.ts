import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { SideSlotEntity } from "./SideSlotEntity";
import { ClubEntity } from "./ClubEntity";

@Entity("lobbies")
export class LobbyEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  createdBy!: string;

  @Column({ type: "text" })
  status!: "open" | "confirmed";

  @Column({ type: "text" })
  visibility!: "public" | "invite" | "private";

  @Column({ type: "integer", default: 2 })
  maxPlayersBySide!: number;

  @Column({ type: "timestamptz" })
  startAt!: Date;

  @Column({ type: "integer" })
  duration_minutes!: Date;

  @ManyToOne(() => ClubEntity, (club) => club.lobbies)
  club!: ClubEntity;

  @Column({ type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @Column({ type: "timestamptz", default: () => "now()" })
  updatedAt!: Date;

  @OneToMany(() => SideSlotEntity, (sideSlot) => sideSlot.lobby)
  sideSlots!: SideSlotEntity[];
}
