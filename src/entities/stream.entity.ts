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

export enum StreamStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum StreamQuality {
  SD = "SD",
  HD = "HD",
  FHD = "FHD",
  UHD = "UHD",
}

export enum StreamResolution {
  "480p" = "480p",
  "720p" = "720p",
  "1080p" = "1080p",
  "4K" = "4K",
}

@Entity("streams")
export class Stream {
  @ApiProperty({ description: "Unique identifier for the stream" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Original name of the stream",
    example: "CNN Live",
  })
  @Column({ name: "original_name", type: "varchar", length: 255 })
  original_name: string;

  @ApiProperty({ description: "Application ID this stream belongs to" })
  @Column({ name: "application_id", type: "uuid" })
  application_id: string;

  @ApiProperty({
    description: "Bouquet ID this stream belongs to",
    required: false,
  })
  @Column({ name: "bouquet_id", type: "uuid", nullable: true })
  bouquet_id?: string;

  @ApiProperty({ description: "Icon URL for the stream", required: false })
  @Column({ name: "icon_url", type: "varchar", length: 500, nullable: true })
  icon_url?: string;

  @ApiProperty({
    description: "Stream URL (HLS/RTMP)",
    example: "https://example.com/stream.m3u8",
  })
  @Column({ name: "url", type: "varchar", length: 500 })
  url: string;

  @ApiProperty({ description: "P2P enabled flag", example: false })
  @Column({ name: "p2p_enabled", type: "boolean", default: false })
  p2p_enabled: boolean;

  @ApiProperty({ description: "Timeshift enabled flag", example: false })
  @Column({ name: "timeshift_enabled", type: "boolean", default: false })
  timeshift_enabled: boolean;

  @ApiProperty({ description: "Timeshift URL", required: false })
  @Column({
    name: "timeshift_url",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  timeshift_url?: string;

  @ApiProperty({ description: "EPG source ID", required: false })
  @Column({ name: "epg_source_id", type: "uuid", nullable: true })
  epg_source_id?: string;

  @ApiProperty({ description: "Channel ID for EPG mapping", required: false })
  @Column({ name: "channel_id", type: "varchar", length: 100, nullable: true })
  channel_id?: string;

  @ApiProperty({ description: "EPG language", example: "en", required: false })
  @Column({ name: "epg_lang", type: "varchar", length: 10, nullable: true })
  epg_lang?: string;

  @ApiProperty({ description: "Description of the stream", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Stream quality",
    enum: StreamQuality,
    example: StreamQuality.HD,
  })
  @Column({
    name: "quality",
    type: "enum",
    enum: StreamQuality,
    default: StreamQuality.HD,
  })
  quality: StreamQuality;

  @ApiProperty({
    description: "Stream resolution",
    enum: StreamResolution,
    example: StreamResolution["1080p"],
  })
  @Column({
    name: "resolution",
    type: "enum",
    enum: StreamResolution,
    default: StreamResolution["1080p"],
  })
  resolution: StreamResolution;

  @ApiProperty({
    description: "Status of the stream",
    enum: StreamStatus,
    example: StreamStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: StreamStatus,
    default: StreamStatus.ENABLED,
  })
  status: StreamStatus;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at", type: "datetime" })
  created_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updated_at: Date;

  @ApiProperty({ description: "Soft delete timestamp", required: false })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;

  // Relationships
  @ManyToOne(() => Application, { onDelete: "CASCADE" })
  @JoinColumn({ name: "application_id" })
  application: Application;

  @ManyToOne(() => Bouquet, { onDelete: "SET NULL" })
  @JoinColumn({ name: "bouquet_id" })
  bouquet?: Bouquet;

  @ManyToMany(() => Bouquet)
  @JoinTable({
    name: "stream_bouquets",
    joinColumn: { name: "stream_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "bouquet_id", referencedColumnName: "id" },
  })
  bouquets: Bouquet[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: "stream_categories",
    joinColumn: { name: "stream_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "category_id", referencedColumnName: "id" },
  })
  categories: Category[];

  @ManyToMany(() => SubCategory)
  @JoinTable({
    name: "stream_sub_categories",
    joinColumn: { name: "stream_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "sub_category_id", referencedColumnName: "id" },
  })
  sub_categories: SubCategory[];

  @ManyToMany(() => Server)
  @JoinTable({
    name: "stream_servers",
    joinColumn: { name: "stream_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "server_id", referencedColumnName: "id" },
  })
  servers: Server[];
}
