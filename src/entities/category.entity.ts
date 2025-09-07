import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { SubCategory } from "./sub-category.entity";
import { ApplicationCategory } from "./application-category.entity";

export enum UseForType {
  LIVE = "live",
  VOD = "vod",
  SERIES = "series",
  DRAMA = "drama",
  MOVIE = "movie",
  SPORTS = "sports",
  NEWS = "news",
  KIDS = "kids",
  MUSIC = "music",
  DOCUMENTARY = "documentary",
}

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "original_name", nullable: false })
  original_name: string;

  @Column({ name: "use_for", type: "set", enum: UseForType })
  use_for: UseForType[];

  @Column({ name: "show_name_on_application", nullable: true })
  show_name_on_application: string;

  @Column({ name: "thumbnail", nullable: true })
  thumbnail: string;

  @Column({ type: "int", default: 0 })
  order: number;

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
  @OneToMany(() => SubCategory, (subCategory) => subCategory.category)
  sub_categories: SubCategory[];

  @OneToMany(
    () => ApplicationCategory,
    (applicationCategory) => applicationCategory.category
  )
  application_categories: ApplicationCategory[];
}
