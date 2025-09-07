import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Application } from "./application.entity";
import { Bouquet } from "./bouquet.entity";
import { Category } from "./category.entity";
import { SubCategory } from "./sub-category.entity";
import { Server } from "./server.entity";
import { DramaEpisode } from "./drama-episode.entity";

export enum DramaStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum DramaSourceType {
  URL = "url",
  STORAGE = "storage",
}

export enum DramaQuality {
  SD = "SD",
  HD = "HD",
  FHD = "FHD",
  UHD = "UHD",
}

export enum DramaResolution {
  "480p" = "480p",
  "720p" = "720p",
  "1080p" = "1080p",
  "4K" = "4K",
}

@Entity("dramas")
export class Drama {
  @ApiProperty({ description: "Unique identifier for the drama" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Original name of the drama",
    example: "Descendants of the Sun",
  })
  @Column({ name: "original_name", type: "varchar", length: 255 })
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "Descendants of the Sun (2016)",
  })
  @Column({ name: "show_app_name", type: "varchar", length: 255 })
  show_app_name: string;

  @ApiProperty({ description: "Description of the drama", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Cover URL for the drama",
    example: "https://example.com/cover.jpg",
    required: false,
  })
  @Column({ name: "cover_url", type: "varchar", length: 500, nullable: true })
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the drama",
    example: "Romance, Action",
    required: false,
  })
  @Column({ name: "genres", type: "text", nullable: true })
  genres?: string;

  @ApiProperty({
    description: "Cast of the drama",
    example: "Song Joong-ki, Song Hye-kyo",
    required: false,
  })
  @Column({ name: "cast", type: "text", nullable: true })
  cast?: string;

  @ApiProperty({
    description: "Director of the drama",
    example: "Lee Eung-bok",
    required: false,
  })
  @Column({ name: "director", type: "varchar", length: 255, nullable: true })
  director?: string;

  @ApiProperty({
    description: "Release date of the drama",
    example: "2016-02-24",
    required: false,
  })
  @Column({ name: "release_date", type: "date", nullable: true })
  release_date?: Date;

  @ApiProperty({
    description: "Language of the drama",
    example: "Korean",
    required: false,
  })
  @Column({ name: "language", type: "varchar", length: 100, nullable: true })
  language?: string;

  @ApiProperty({
    description: "Status of the drama",
    enum: DramaStatus,
    example: DramaStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: DramaStatus,
    default: DramaStatus.ENABLED,
  })
  status: DramaStatus;

  @ApiProperty({
    description: "IMDB ID of the drama",
    example: "tt4925000",
    required: false,
  })
  @Column({
    name: "imdb_id",
    type: "varchar",
    length: 20,
    nullable: true,
    unique: true,
  })
  imdb_id?: string;

  @ApiProperty({
    description: "TMDB ID of the drama",
    example: "65494",
    required: false,
  })
  @Column({
    name: "tmdb_id",
    type: "varchar",
    length: 20,
    nullable: true,
    unique: true,
  })
  tmdb_id?: string;

  @ApiProperty({
    description: "Source type of the drama",
    enum: DramaSourceType,
    example: DramaSourceType.URL,
  })
  @Column({
    name: "source_type",
    type: "enum",
    enum: DramaSourceType,
    default: DramaSourceType.URL,
  })
  source_type: DramaSourceType;

  @ApiProperty({
    description: "Source URL for the drama",
    example: "https://example.com/drama",
    required: false,
  })
  @Column({ name: "source_url", type: "varchar", length: 500, nullable: true })
  source_url?: string;

  @ApiProperty({ description: "Server ID for storage", required: false })
  @Column({ name: "server_id", type: "uuid", nullable: true })
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the drama",
    example: "/dramas/descendants-of-the-sun",
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
    description: "Drama quality",
    enum: DramaQuality,
    example: DramaQuality.HD,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: DramaQuality,
    default: DramaQuality.HD,
  })
  quality: DramaQuality;

  @ApiProperty({
    description: "Drama resolution",
    enum: DramaResolution,
    example: DramaResolution["1080p"],
  })
  @Column({
    name: "resolution",
    type: "enum",
    enum: DramaResolution,
    default: DramaResolution["1080p"],
  })
  resolution: DramaResolution;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "added_at", type: "datetime" })
  added_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updated_at: Date;

  @ApiProperty({ description: "Soft delete timestamp", required: false })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  @ApiProperty({ description: "All-time views count", example: 3000 })
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

  @OneToMany(() => DramaEpisode, (episode) => episode.drama, { cascade: true })
  episodes: DramaEpisode[];

  @ManyToMany(() => Bouquet)
  @JoinTable({
    name: "drama_bouquets",
    joinColumn: { name: "drama_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "bouquet_id", referencedColumnName: "id" },
  })
  bouquets: Bouquet[];
}
