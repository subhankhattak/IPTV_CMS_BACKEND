import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Application } from "./application.entity";
import { Users } from "./user.entity";

@Entity("application_assignments")
export class ApplicationAssignment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_id", nullable: false })
  application_id: string;

  @Column({ name: "reseller_id", nullable: false })
  reseller_id: string;

  @Column({ name: "assignment_type", nullable: false })
  assignment_type: "FREE" | "PAID" | "THEMED";

  @Column({
    name: "price",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price: number;

  @Column({ name: "theme_variant", nullable: true })
  theme_variant: string;

  @Column({ default: true })
  status: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Application, (application) => application.assignments)
  @JoinColumn({ name: "application_id" })
  application: Application;

  @ManyToOne(() => Users, (user) => user.application_assignments)
  @JoinColumn({ name: "reseller_id" })
  reseller: Users;
}
