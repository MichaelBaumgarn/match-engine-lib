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

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ type: "text" })
  city!: string;

  @Column({ type: "text", unique: true, nullable: true })
  slug?: string;

  @OneToMany(() => LobbyEntity, (lobby) => lobby.club)
  lobbies!: LobbyEntity[];
}
