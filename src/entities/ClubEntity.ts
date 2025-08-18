import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { LobbyEntity } from "./LobbyEntity";

@Entity("clubs")
export class ClubEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "string" })
  name!: string;

  @Column({ type: "string" })
  address!: string;

  @Column({ type: "string" })
  city!: string;

  @OneToMany(() => LobbyEntity, (lobby) => lobby.club)
  lobbies!: LobbyEntity[];
}
