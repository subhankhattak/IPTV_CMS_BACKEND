import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { ApplicationSubCategory } from "./application-sub-category.entity";

@Entity("sub_categories")
export class SubCategory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "original_name", nullable: false })
  original_name: string;

  @Column({ name: "category_id", nullable: false })
  category_id: string;

  @Column({ name: "show_name_on_application", nullable: true })
  show_name_on_application: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ name: "thumbnail", nullable: true })
  thumbnail: string;

  @Column({ type: "int", default: 0 })
  order: number;

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
  @ManyToOne(() => Category, (category) => category.sub_categories)
  @JoinColumn({ name: "category_id" })
  category: Category;

  @OneToMany(
    () => ApplicationSubCategory,
    (applicationSubCategory) => applicationSubCategory.sub_category
  )
  application_sub_categories: ApplicationSubCategory[];
}
