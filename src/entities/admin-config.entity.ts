import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("admin_configs")
export class AdminConfig {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "module_name", nullable: false, unique: true })
  module_name: string;

  @Column({ name: "allow_admin_crud", default: false })
  allow_admin_crud: boolean;

  @Column({ name: "admin_view_only", default: true })
  admin_view_only: boolean;

  @Column({ type: "text", nullable: true })
  description: string;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
