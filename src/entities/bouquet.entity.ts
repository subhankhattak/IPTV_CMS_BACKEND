import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum BouquetStatus {
  ENABLED = "enabled",
  DISABLED = "disabled",
}

export enum BouquetRegion {
  NORTH_AMERICA = "North America",
  EUROPE = "Europe",
  ASIA = "Asia",
  AFRICA = "Africa",
  SOUTH_AMERICA = "South America",
  AUSTRALIA = "Australia",
  MIDDLE_EAST = "Middle East",
}

@Entity("bouquets")
export class Bouquet {
  @ApiProperty({ description: "Unique identifier for the bouquet" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Name of the bouquet",
    example: "Premium Sports Package",
  })
  @Column({ name: "name", type: "varchar", length: 255, unique: true })
  name: string;

  @ApiProperty({
    description: "Region for the bouquet",
    enum: BouquetRegion,
    example: BouquetRegion.NORTH_AMERICA,
  })
  @Column({
    name: "region",
    type: "enum",
    enum: BouquetRegion,
    default: BouquetRegion.NORTH_AMERICA,
  })
  region: BouquetRegion;

  @ApiProperty({
    description: "Description of the bouquet",
    example: "Premium sports channels package for North America",
    required: false,
  })
  @Column({ name: "description", type: "text", nullable: true })
  description: string;

  @ApiProperty({
    description: "Status of the bouquet",
    enum: BouquetStatus,
    example: BouquetStatus.ENABLED,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: BouquetStatus,
    default: BouquetStatus.ENABLED,
  })
  status: BouquetStatus;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at", type: "datetime" })
  created_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updated_at: Date;

  @ApiProperty({ description: "Soft delete timestamp", required: false })
  @DeleteDateColumn({ name: "deleted_at" })
  deleted_at?: Date;
}
