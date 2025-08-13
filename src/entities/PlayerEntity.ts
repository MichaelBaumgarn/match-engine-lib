import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { SideSlotEntity } from "./SideSlotEntity";

@Entity("players")
export class PlayerEntity {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;
}
