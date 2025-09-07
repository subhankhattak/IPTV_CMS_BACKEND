import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsUrl,
  ValidateIf,
} from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { CreateStreamDto } from "./create-stream.dto";
import {
  StreamStatus,
  StreamQuality,
  StreamResolution,
} from "../../entities/stream.entity";

export class UpdateStreamDto extends PartialType(CreateStreamDto) {
  @ApiProperty({
    description: "Original name of the stream",
    example: "CNN Live",
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  original_name?: string;

  @ApiProperty({
    description: "Application ID this stream belongs to",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  application_id?: string;

  @ApiProperty({
    description: "Bouquet ID this stream belongs to",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  bouquet_id?: string;

  @ApiProperty({
    description: "Icon URL for the stream",
    example: "https://example.com/icon.png",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  icon_url?: string;

  @ApiProperty({
    description: "Stream URL (HLS/RTMP)",
    example: "https://example.com/stream.m3u8",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: "P2P enabled flag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  p2p_enabled?: boolean;

  @ApiProperty({
    description: "Timeshift enabled flag",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  timeshift_enabled?: boolean;

  @ApiProperty({
    description: "Timeshift URL",
    example: "https://example.com/timeshift.m3u8",
    required: false,
  })
  @ValidateIf((o) => o.timeshift_enabled === true)
  @IsOptional()
  @IsUrl()
  timeshift_url?: string;

  @ApiProperty({
    description: "EPG source ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  epg_source_id?: string;

  @ApiProperty({
    description: "Channel ID for EPG mapping",
    example: "cnn",
    required: false,
  })
  @IsOptional()
  @IsString()
  channel_id?: string;

  @ApiProperty({
    description: "EPG language",
    example: "en",
    required: false,
  })
  @IsOptional()
  @IsString()
  epg_lang?: string;

  @ApiProperty({
    description: "Description of the stream",
    example: "CNN Live News Stream",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Stream quality",
    enum: StreamQuality,
    example: StreamQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamQuality)
  quality?: StreamQuality;

  @ApiProperty({
    description: "Stream resolution",
    enum: StreamResolution,
    example: StreamResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamResolution)
  resolution?: StreamResolution;

  @ApiProperty({
    description: "Status of the stream",
    enum: StreamStatus,
    example: StreamStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(StreamStatus)
  status?: StreamStatus;

  @ApiProperty({
    description: "Array of category IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  category_ids?: string[];

  @ApiProperty({
    description: "Array of sub-category IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  sub_category_ids?: string[];

  @ApiProperty({
    description: "Array of server IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  server_ids?: string[];
}
