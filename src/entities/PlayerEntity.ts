import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("players")
export class PlayerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", name: "name" })
  name!: string;

  @Column({ type: "text", nullable: true, name: "skill_level" })
  skillLevel?: string;

  @Column({ type: "text", nullable: true, name: "profile_picture" })
  profilePicture?: string;

  @Column({ type: "text", nullable: true, name: "city" })
  city?: string;

  @Column({ type: "text", nullable: true, name: "supabase_id" })
  supabaseId?: string;

  @Column({ type: "text", nullable: true, unique: true, name: "email" })
  email?: string;
}
