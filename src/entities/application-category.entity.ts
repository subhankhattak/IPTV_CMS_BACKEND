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
import { Category } from "./category.entity";

@Entity("application_categories")
export class ApplicationCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_id", nullable: false })
  application_id: string;

  @Column({ name: "category_id", nullable: false })
  category_id: string;

  @Column({ name: "alias", nullable: true })
  alias: string;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ default: true })
  status: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  // Relationships
  @ManyToOne(
    () => Application,
    (application) => application.application_categories
  )
  @JoinColumn({ name: "application_id" })
  application: Application;

  @ManyToOne(() => Category, (category) => category.application_categories)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
