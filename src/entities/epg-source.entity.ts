import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("epg_sources")
export class EpgSource {
  @ApiProperty({ description: "Unique identifier for the EPG source" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Name of the EPG source", example: "XMLTV" })
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @ApiProperty({
    description: "Provider code for the EPG source",
    example: "xmltv",
  })
  @Column({ name: "provider_code", type: "varchar", length: 100 })
  provider_code: string;

  @ApiProperty({
    description: "EPG source URL",
    example: "https://example.com/epg.xml",
  })
  @Column({ name: "url", type: "varchar", length: 500, nullable: true })
  url?: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ name: "created_at", type: "datetime" })
  created_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updated_at: Date;
}
