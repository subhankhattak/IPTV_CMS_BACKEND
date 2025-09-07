import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum ServerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity("servers")
export class Server {
  @ApiProperty({ description: "Unique identifier for the server" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Name of the server",
    example: "Stream Server 1",
  })
  @Column({ name: "name", type: "varchar", length: 255 })
  name: string;

  @ApiProperty({
    description: "Server host/IP address",
    example: "192.168.1.100",
  })
  @Column({ name: "host", type: "varchar", length: 255 })
  host: string;

  @ApiProperty({ description: "Server port", example: 8080 })
  @Column({ name: "port", type: "int", default: 80 })
  port: number;

  @ApiProperty({
    description: "Status of the server",
    enum: ServerStatus,
    example: ServerStatus.ACTIVE,
  })
  @Column({
    name: "status",
    type: "enum",
    enum: ServerStatus,
    default: ServerStatus.ACTIVE,
  })
  status: ServerStatus;

  @ApiProperty({ description: "Server description", required: false })
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ 
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP"
  })
  created_at: Date;

  @ApiProperty({ description: "Last update timestamp" })
  @UpdateDateColumn({ 
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  updated_at: Date;
}
