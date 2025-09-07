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
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Series } from "./series.entity";
import { Episode } from "./episode.entity";

export enum SeasonStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

@Entity("seasons")
export class Season {
  @ApiProperty({ description: "Unique identifier for the season" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Season number", example: 1 })
  @Column({ name: "season_number", type: "int" })
  season_number: number;

  @ApiProperty({
    description: "Season name",
    example: "Season 1",
    required: false,
  })
  @Column({ name: "name", type: "varchar", length: 255, nullable: true })
  name?: string;

  @ApiProperty({ description: "Description of the season", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({
    description: "Cover URL for the season",
    example: "https://example.com/season1.jpg",
    required: false,
  })
  @Column({ name: "cover_url", type: "varchar", length: 500, nullable: true })
  cover_url?: string;

  @ApiProperty({
    description: "Status of the season",
    enum: SeasonStatus,
    example: SeasonStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: SeasonStatus,
    default: SeasonStatus.ENABLED,
  })
  status: SeasonStatus;

  @ApiProperty({ description: "Series ID this season belongs to" })
  @Column({ name: "series_id", type: "uuid" })
  series_id: string;

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

  // Relationships
  @ManyToOne(() => Series, (series) => series.seasons, { onDelete: "CASCADE" })
  @JoinColumn({ name: "series_id" })
  series: Series;

  @OneToMany(() => Episode, (episode) => episode.season, { cascade: true })
  episodes: Episode[];
}
