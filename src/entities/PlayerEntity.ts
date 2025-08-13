import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("players")
export class PlayerEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text" })
  name!: string;

  // Optional: If you add rank, rating, etc later:
  // @Column({ type: 'integer', nullable: true })
  // rating?: number;
}
