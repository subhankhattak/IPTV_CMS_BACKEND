import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Application } from "./application.entity";
import { Bouquet } from "./bouquet.entity";
import { Category } from "./category.entity";
import { SubCategory } from "./sub-category.entity";
import { Server } from "./server.entity";

export enum RadioStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum RadioSourceType {
  URL = "url",
  STORAGE = "storage",
}

export enum RadioQuality {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

@Entity("radios")
export class Radio {
  @ApiProperty({ description: "Unique identifier for the radio station" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Original name of the radio station",
    example: "BBC Radio 1",
  })
  @Column({ name: "original_name", type: "varchar", length: 255 })
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "BBC Radio 1 (UK)",
  })
  @Column({ name: "show_app_name", type: "varchar", length: 255 })
  show_app_name: string;

  @ApiProperty({
    description: "Description of the radio station",
    required: false,
  })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Cover URL for the radio station",
    example: "https://example.com/radio1.jpg",
    required: false,
  })
  @Column({ name: "cover_url", type: "varchar", length: 500, nullable: true })
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the radio station",
    example: "Pop, Rock, Electronic",
    required: false,
  })
  @Column({ name: "genres", type: "text", nullable: true })
  genres?: string;

  @ApiProperty({
    description: "Language of the radio station",
    example: "English",
    required: false,
  })
  @Column({ name: "language", type: "varchar", length: 100, nullable: true })
  language?: string;

  @ApiProperty({
    description: "Country of the radio station",
    example: "United Kingdom",
    required: false,
  })
  @Column({ name: "country", type: "varchar", length: 100, nullable: true })
  country?: string;

  @ApiProperty({
    description: "Status of the radio station",
    enum: RadioStatus,
    example: RadioStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: RadioStatus,
    default: RadioStatus.ENABLED,
  })
  status: RadioStatus;

  @ApiProperty({
    description: "Source type of the radio station",
    enum: RadioSourceType,
    example: RadioSourceType.URL,
  })
  @Column({
    name: "source_type",
    type: "enum",
    enum: RadioSourceType,
    default: RadioSourceType.URL,
  })
  source_type: RadioSourceType;

  @ApiProperty({
    description: "Source URL for the radio station",
    example: "https://stream.radio1.com/live",
    required: false,
  })
  @Column({ name: "source_url", type: "varchar", length: 500, nullable: true })
  source_url?: string;

  @ApiProperty({ description: "Server ID for storage", required: false })
  @Column({ name: "server_id", type: "uuid", nullable: true })
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the radio station",
    example: "/radios/bbc-radio1.mp3",
    required: false,
  })
  @Column({
    name: "storage_path",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  storage_path?: string;

  @ApiProperty({ description: "Category ID", required: false })
  @Column({ name: "category_id", type: "uuid", nullable: true })
  category_id?: string;

  @ApiProperty({ description: "Sub-category ID", required: false })
  @Column({ name: "sub_category_id", type: "uuid", nullable: true })
  sub_category_id?: string;

  @ApiProperty({ description: "Application ID", required: false })
  @Column({ name: "application_id", type: "uuid", nullable: true })
  application_id?: string;

  @ApiProperty({
    description: "Radio quality",
    enum: RadioQuality,
    example: RadioQuality.HIGH,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: RadioQuality,
    default: RadioQuality.HIGH,
  })
  quality: RadioQuality;

  @ApiProperty({
    description: "Bitrate in kbps",
    example: 128,
    required: false,
  })
  @Column({ name: "bitrate", type: "int", nullable: true })
  bitrate?: number;

  @ApiProperty({
    description: "Frequency in MHz",
    example: 98.5,
    required: false,
  })
  @Column({
    name: "frequency",
    type: "decimal",
    precision: 5,
    scale: 2,
    nullable: true,
  })
  frequency?: number;

  @ApiProperty({
    description: "Website URL of the radio station",
    example: "https://www.bbc.co.uk/radio1",
    required: false,
  })
  @Column({ name: "website_url", type: "varchar", length: 500, nullable: true })
  website_url?: string;

  @ApiProperty({
    description: "Creation timestamp",
  })
  @CreateDateColumn({ name: "added_at", type: "datetime" })
  added_at: Date;

  @ApiProperty({
    description: "Last update timestamp",
  })
  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updated_at: Date;

  @ApiProperty({
    description: "Soft delete timestamp",
    required: false,
  })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  @ApiProperty({
    description: "All-time views count",
    example: 5000,
  })
  @Column({ name: "all_time_views", type: "int", default: 0 })
  all_time_views: number;

  // Relationships
  @ManyToOne(() => Application, { onDelete: "SET NULL" })
  @JoinColumn({ name: "application_id" })
  application?: Application;

  @ManyToOne(() => Category, { onDelete: "SET NULL" })
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @ManyToOne(() => SubCategory, { onDelete: "SET NULL" })
  @JoinColumn({ name: "sub_category_id" })
  sub_category?: SubCategory;

  @ManyToOne(() => Server, { onDelete: "SET NULL" })
  @JoinColumn({ name: "server_id" })
  server?: Server;

  @ManyToMany(() => Bouquet)
  @JoinTable({
    name: "radio_bouquets",
    joinColumn: { name: "radio_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "bouquet_id", referencedColumnName: "id" },
  })
  bouquets: Bouquet[];
}
