import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ApplicationCategory } from "./application-category.entity";
import { ApplicationSubCategory } from "./application-sub-category.entity";
import { ApplicationAssignment } from "./application-assignment.entity";

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ name: "logo_path", nullable: true })
  logo_path: string;

  @Column({ name: "user_agent", nullable: false })
  user_agent: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  theme: string;

  @Column({ name: "color_scheme", nullable: true })
  color_scheme: string;

  @Column({ default: true })
  status: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  // Relationships
  @OneToMany(
    () => ApplicationCategory,
    (applicationCategory) => applicationCategory.application
  )
  application_categories: ApplicationCategory[];

  @OneToMany(
    () => ApplicationSubCategory,
    (applicationSubCategory) => applicationSubCategory.application
  )
  application_sub_categories: ApplicationSubCategory[];

  @OneToMany(
    () => ApplicationAssignment,
    (assignment) => assignment.application
  )
  assignments: ApplicationAssignment[];
}
