import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Bouquet } from "./bouquet.entity";
import { Users } from "./user.entity";

export enum MergeAction {
  DISABLE = "disable",
  DELETE = "delete",
}

@Entity("bouquet_merge_logs")
export class BouquetMergeLog {
  @ApiProperty({ description: "Unique identifier for the merge log" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Array of source bouquet IDs that were merged",
    example: ["uuid1", "uuid2", "uuid3"],
  })
  @Column({ name: "source_ids", type: "json" })
  source_ids: string[];

  @ApiProperty({
    description: "Target bouquet ID that received the merged content",
  })
  @Column({ name: "target_id", type: "uuid" })
  target_id: string;

  @ApiProperty({ description: "User ID who performed the merge operation" })
  @Column({ name: "actor_id", type: "uuid" })
  actor_id: string;

  @ApiProperty({
    description: "Action taken on source bouquets after merge",
    enum: MergeAction,
    example: MergeAction.DISABLE,
  })
  @Column({
    name: "action",
    type: "enum",
    enum: MergeAction,
  })
  action: MergeAction;

  @ApiProperty({ description: "Creation timestamp" })
  @CreateDateColumn({ 
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP"
  })
  created_at: Date;

  // Relationships
  @ManyToOne(() => Bouquet, { onDelete: "CASCADE" })
  @JoinColumn({ name: "target_id" })
  target_bouquet: Bouquet;

  @ManyToOne(() => Users, { onDelete: "CASCADE" })
  @JoinColumn({ name: "actor_id" })
  actor: Users;
}
