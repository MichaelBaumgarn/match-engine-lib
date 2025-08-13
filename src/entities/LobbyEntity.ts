import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SideSlotEntity } from "./SideSlotEntity";

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

  @OneToMany(() => SideSlotEntity, (sideSlot) => sideSlot.lobby)
  sideSlots!: SideSlotEntity[];
}
