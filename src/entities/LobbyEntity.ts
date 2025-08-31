import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
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

  @Column({ type: "integer", default: 2 })
  maxPlayersBySide!: number;

  @Column({ type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @Column({ type: "timestamptz", default: () => "now()" })
  updatedAt!: Date;

  @Column({ type: "timestamptz" })
  startAt!: Date;

  @Column({ type: "integer" })
  durationMinutes!: number;

  @Column({ type: "text" })
  visibility!: "public" | "invite" | "private";

  @Column({ type: "text" })
  courtName!: string;

  @ManyToOne(() => ClubEntity, (club) => club.lobbies)
  @JoinColumn()
  club!: ClubEntity;

  @OneToMany(() => SideSlotEntity, (sideSlot) => sideSlot.lobby)
  sideSlots!: SideSlotEntity[];
}
