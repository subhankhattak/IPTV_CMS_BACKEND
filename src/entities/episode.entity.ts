import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Season } from "./season.entity";

export enum EpisodeStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum EpisodeSourceType {
  URL = "url",
  STORAGE = "storage",
}

export enum EpisodeQuality {
  SD = "SD",
  HD = "HD",
  FHD = "FHD",
  UHD = "UHD",
}

export enum EpisodeResolution {
  "480p" = "480p",
  "720p" = "720p",
  "1080p" = "1080p",
  "4K" = "4K",
}

@Entity("episodes")
export class Episode {
  @ApiProperty({ description: "Unique identifier for the episode" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Episode number", example: 1 })
  @Column({ name: "episode_number", type: "int" })
  episode_number: number;

  @ApiProperty({ description: "Episode title", example: "Pilot" })
  @Column({ name: "title", type: "varchar", length: 255 })
  title: string;

  @ApiProperty({ description: "Description of the episode", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Cover URL for the episode",
    example: "https://example.com/episode1.jpg",
    required: false,
  })
  @Column({ name: "cover_url", type: "varchar", length: 500, nullable: true })
  cover_url?: string;

  @ApiProperty({
    description: "Status of the episode",
    enum: EpisodeStatus,
    example: EpisodeStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: EpisodeStatus,
    default: EpisodeStatus.ENABLED,
  })
  status: EpisodeStatus;

  @ApiProperty({
    description: "Source type of the episode",
    enum: EpisodeSourceType,
    example: EpisodeSourceType.URL,
  })
  @Column({
    name: "source_type",
    type: "enum",
    enum: EpisodeSourceType,
    default: EpisodeSourceType.URL,
  })
  source_type: EpisodeSourceType;

  @ApiProperty({
    description: "Source URL for the episode",
    example: "https://example.com/episode1.mp4",
    required: false,
  })
  @Column({ name: "source_url", type: "varchar", length: 500, nullable: true })
  source_url?: string;

  @ApiProperty({
    description: "Storage path for the episode",
    example: "/series/breaking-bad/s01e01.mp4",
    required: false,
  })
  @Column({
    name: "storage_path",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  storage_path?: string;

  @ApiProperty({
    description: "Episode quality",
    enum: EpisodeQuality,
    example: EpisodeQuality.HD,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: EpisodeQuality,
    default: EpisodeQuality.HD,
  })
  quality: EpisodeQuality;

  @ApiProperty({
    description: "Episode resolution",
    enum: EpisodeResolution,
    example: EpisodeResolution["1080p"],
  })
  @Column({
    name: "resolution",
    type: "enum",
    enum: EpisodeResolution,
    default: EpisodeResolution["1080p"],
  })
  resolution: EpisodeResolution;

  @ApiProperty({
    description: "Duration in minutes",
    example: 45,
    required: false,
  })
  @Column({ name: "duration", type: "int", nullable: true })
  duration?: number;

  @ApiProperty({
    description: "Air date of the episode",
    example: "2008-01-20",
    required: false,
  })
  @Column({ name: "air_date", type: "date", nullable: true })
  air_date?: Date;

  @ApiProperty({ description: "Season ID this episode belongs to" })
  @Column({ name: "season_id", type: "uuid" })
  season_id: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

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
  @ManyToOne(() => Season, (season) => season.episodes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "season_id" })
  season: Season;
}
