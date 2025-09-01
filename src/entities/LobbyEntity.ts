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

  @Column({ type: "uuid", name: "created_by" })
  createdBy!: string;

  @Column({ type: "text", name: "status" })
  status!: "open" | "confirmed";

  @Column({ type: "integer", default: 2, name: "max_players_by_side" })
  maxPlayersBySide!: number;

  @Column({ type: "timestamptz", default: () => "now()", name: "created_at" })
  createdAt!: Date;

  @Column({ type: "timestamptz", default: () => "now()", name: "updated_at" })
  updatedAt!: Date;

  @Column({ type: "timestamptz", name: "start_at" })
  startAt!: Date;

  @Column({ type: "integer", name: "duration_minutes" })
  durationMinutes!: number;

  @Column({ type: "text", name: "visibility" })
  visibility!: "public" | "invite" | "private";

  @Column({ type: "text", name: "court_name" })
  courtName!: string;

  @ManyToOne(() => ClubEntity, (club) => club.lobbies)
  @JoinColumn({ name: "club_id" })
  club!: ClubEntity;

  @OneToMany(() => SideSlotEntity, (sideSlot) => sideSlot.lobby)
  sideSlots!: SideSlotEntity[];
}
