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

export enum MovieStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum MovieSourceType {
  URL = "url",
  STORAGE = "storage",
}

export enum MovieQuality {
  SD = "SD",
  HD = "HD",
  FHD = "FHD",
  UHD = "UHD",
}

export enum MovieResolution {
  "480p" = "480p",
  "720p" = "720p",
  "1080p" = "1080p",
  "4K" = "4K",
}

@Entity("movies")
export class Movie {
  @ApiProperty({ description: "Unique identifier for the movie" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Original name of the movie",
    example: "The Matrix",
  })
  @Column({ name: "original_name", type: "varchar", length: 255 })
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "The Matrix (1999)",
  })
  @Column({ name: "show_app_name", type: "varchar", length: 255 })
  show_app_name: string;

  @ApiProperty({ description: "Description of the movie", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Cover URL for the movie",
    example: "https://example.com/cover.jpg",
    required: false,
  })
  @Column({ name: "cover_url", type: "varchar", length: 500, nullable: true })
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the movie",
    example: "Action, Sci-Fi",
    required: false,
  })
  @Column({ name: "genres", type: "text", nullable: true })
  genres?: string;

  @ApiProperty({
    description: "Cast of the movie",
    example: "Keanu Reeves, Laurence Fishburne",
    required: false,
  })
  @Column({ name: "cast", type: "text", nullable: true })
  cast?: string;

  @ApiProperty({
    description: "Director of the movie",
    example: "Lana Wachowski",
    required: false,
  })
  @Column({ name: "director", type: "varchar", length: 255, nullable: true })
  director?: string;

  @ApiProperty({
    description: "Release date of the movie",
    example: "1999-03-31",
    required: false,
  })
  @Column({ name: "release_date", type: "date", nullable: true })
  release_date?: Date;

  @ApiProperty({
    description: "Language of the movie",
    example: "English",
    required: false,
  })
  @Column({ name: "language", type: "varchar", length: 100, nullable: true })
  language?: string;

  @ApiProperty({
    description: "Status of the movie",
    enum: MovieStatus,
    example: MovieStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: MovieStatus,
    default: MovieStatus.ENABLED,
  })
  status: MovieStatus;

  @ApiProperty({
    description: "IMDB ID of the movie",
    example: "tt0133093",
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
    description: "TMDB ID of the movie",
    example: "603",
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
    description: "Source type of the movie",
    enum: MovieSourceType,
    example: MovieSourceType.URL,
  })
  @Column({
    name: "source_type",
    type: "enum",
    enum: MovieSourceType,
    default: MovieSourceType.URL,
  })
  source_type: MovieSourceType;

  @ApiProperty({
    description: "Source URL for the movie",
    example: "https://example.com/movie.mp4",
    required: false,
  })
  @Column({ name: "source_url", type: "varchar", length: 500, nullable: true })
  source_url?: string;

  @ApiProperty({ description: "Server ID for storage", required: false })
  @Column({ name: "server_id", type: "uuid", nullable: true })
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the movie",
    example: "/movies/matrix.mp4",
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
    description: "Movie quality",
    enum: MovieQuality,
    example: MovieQuality.HD,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: MovieQuality,
    default: MovieQuality.HD,
  })
  quality: MovieQuality;

  @ApiProperty({
    description: "Movie resolution",
    enum: MovieResolution,
    example: MovieResolution["1080p"],
  })
  @Column({
    name: "resolution",
    type: "enum",
    enum: MovieResolution,
    default: MovieResolution["1080p"],
  })
  resolution: MovieResolution;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({
    name: "added_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  added_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @ApiProperty({ description: "Soft delete timestamp", required: false })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  @ApiProperty({ description: "All-time views count", example: 1500 })
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
    name: "movie_bouquets",
    joinColumn: { name: "movie_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "bouquet_id", referencedColumnName: "id" },
  })
  bouquets: Bouquet[];
}
