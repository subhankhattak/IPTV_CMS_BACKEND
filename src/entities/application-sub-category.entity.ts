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
import { SubCategory } from "./sub-category.entity";

@Entity("application_sub_categories")
export class ApplicationSubCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "application_id", nullable: false })
  application_id: string;

  @Column({ name: "sub_category_id", nullable: false })
  sub_category_id: string;

  @Column({ name: "alias", nullable: true })
  alias: string;

  @Column({ type: "int", default: 0 })
  order: number;

  @Column({ default: true })
  status: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @UpdateDateColumn({
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  // Relationships
  @ManyToOne(
    () => Application,
    (application) => application.application_sub_categories
  )
  @JoinColumn({ name: "application_id" })
  application: Application;

  @ManyToOne(
    () => SubCategory,
    (subCategory) => subCategory.application_sub_categories
  )
  @JoinColumn({ name: "sub_category_id" })
  sub_category: SubCategory;
}
