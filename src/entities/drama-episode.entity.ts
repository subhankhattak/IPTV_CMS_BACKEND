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
import { Drama } from "./drama.entity";

export enum DramaEpisodeStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum DramaEpisodeSourceType {
  URL = "url",
  STORAGE = "storage",
}

export enum DramaEpisodeQuality {
  SD = "SD",
  HD = "HD",
  FHD = "FHD",
  UHD = "UHD",
}

export enum DramaEpisodeResolution {
  "480p" = "480p",
  "720p" = "720p",
  "1080p" = "1080p",
  "4K" = "4K",
}

@Entity("drama_episodes")
export class DramaEpisode {
  @ApiProperty({ description: "Unique identifier for the drama episode" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Episode number", example: 1 })
  @Column({ name: "episode_number", type: "int" })
  episode_number: number;

  @ApiProperty({ description: "Episode title", example: "Episode 1" })
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
    enum: DramaEpisodeStatus,
    example: DramaEpisodeStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: DramaEpisodeStatus,
    default: DramaEpisodeStatus.ENABLED,
  })
  status: DramaEpisodeStatus;

  @ApiProperty({
    description: "Source type of the episode",
    enum: DramaEpisodeSourceType,
    example: DramaEpisodeSourceType.URL,
  })
  @Column({
    name: "source_type",
    type: "enum",
    enum: DramaEpisodeSourceType,
    default: DramaEpisodeSourceType.URL,
  })
  source_type: DramaEpisodeSourceType;

  @ApiProperty({
    description: "Source URL for the episode",
    example: "https://example.com/episode1.mp4",
    required: false,
  })
  @Column({ name: "source_url", type: "varchar", length: 500, nullable: true })
  source_url?: string;

  @ApiProperty({
    description: "Storage path for the episode",
    example: "/dramas/descendants-of-the-sun/e01.mp4",
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
    enum: DramaEpisodeQuality,
    example: DramaEpisodeQuality.HD,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: DramaEpisodeQuality,
    default: DramaEpisodeQuality.HD,
  })
  quality: DramaEpisodeQuality;

  @ApiProperty({
    description: "Episode resolution",
    enum: DramaEpisodeResolution,
    example: DramaEpisodeResolution["1080p"],
  })
  @Column({
    name: "resolution",
    type: "enum",
    enum: DramaEpisodeResolution,
    default: DramaEpisodeResolution["1080p"],
  })
  resolution: DramaEpisodeResolution;

  @ApiProperty({
    description: "Duration in minutes",
    example: 60,
    required: false,
  })
  @Column({ name: "duration", type: "int", nullable: true })
  duration?: number;

  @ApiProperty({
    description: "Air date of the episode",
    example: "2016-02-24",
    required: false,
  })
  @Column({ name: "air_date", type: "date", nullable: true })
  air_date?: Date;

  @ApiProperty({ description: "Drama ID this episode belongs to" })
  @Column({ name: "drama_id", type: "uuid" })
  drama_id: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @ApiProperty({ description: "Soft delete timestamp", required: false })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  @ApiProperty({ description: "All-time views count", example: 2000 })
  @Column({ name: "all_time_views", type: "int", default: 0 })
  all_time_views: number;

  // Relationships
  @ManyToOne(() => Drama, (drama) => drama.episodes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "drama_id" })
  drama: Drama;
}
