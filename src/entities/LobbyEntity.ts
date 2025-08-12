import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { SideSlotEntity } from "./SideSlotEntity";

@Entity("lobbies")
export class LobbyEntity {
  @PrimaryColumn()
  id!: number;

  @Column()
  createdBy!: number;

  @Column()
  status!: string;

  @OneToMany(() => SideSlotEntity, (slot) => slot.lobby, { cascade: true })
  sideSlots!: SideSlotEntity[];
}
