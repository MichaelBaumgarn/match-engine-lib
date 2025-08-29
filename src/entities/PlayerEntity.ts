import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("players")
export class PlayerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text", nullable: true })
  skillLevel?: string;

  @Column({ type: "text", nullable: true })
  profilePicture?: string;

  @Column({ type: "text", nullable: true })
  city?: string;

  @Column({ type: "text", nullable: true, unique: true })
  supabaseId?: string;

  @Column({ type: "text", nullable: true, unique: true })
  email?: string;
}
