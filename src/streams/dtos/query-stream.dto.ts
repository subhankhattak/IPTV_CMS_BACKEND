import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  StreamStatus,
  StreamQuality,
  StreamResolution,
} from "../../entities/stream.entity";

export class QueryStreamDto {
  @ApiProperty({
    description: "Search by stream name",
    example: "CNN",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Search by channel ID",
    example: "cnn",
    required: false,
  })
  @IsOptional()
  @IsString()
  channel_id?: string;

  @ApiProperty({
    description: "Search by URL",
    example: "https://example.com",
    required: false,
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({
    description: "Filter by application ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  application_id?: string;

  @ApiProperty({
    description: "Filter by category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  category_id?: string;

  @ApiProperty({
    description: "Filter by sub-category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  sub_category_id?: string;

  @ApiProperty({
    description: "Filter by server ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  server_id?: string;

  @ApiProperty({
    description: "Filter by status",
    enum: StreamStatus,
    example: StreamStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamStatus)
  status?: StreamStatus;

  @ApiProperty({
    description: "Filter by P2P enabled",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  p2p_enabled?: boolean;

  @ApiProperty({
    description: "Filter by timeshift enabled",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  timeshift_enabled?: boolean;

  @ApiProperty({
    description: "Filter by quality",
    enum: StreamQuality,
    example: StreamQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamQuality)
  quality?: StreamQuality;

  @ApiProperty({
    description: "Filter by resolution",
    enum: StreamResolution,
    example: StreamResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamResolution)
  resolution?: StreamResolution;

  @ApiProperty({
    description: "Sort by field",
    example: "original_name",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "Sort order",
    example: "ASC",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";

  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
