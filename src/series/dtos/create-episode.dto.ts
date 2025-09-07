import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsUrl,
  IsDateString,
  ValidateIf,
  Min,
} from "class-validator";
import {
  EpisodeStatus,
  EpisodeSourceType,
  EpisodeQuality,
  EpisodeResolution,
} from "../../entities/episode.entity";

export class CreateEpisodeDto {
  @ApiProperty({
    description: "Episode number",
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  episode_number: number;

  @ApiProperty({
    description: "Episode title",
    example: "Pilot",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Description of the episode",
    example: "The first episode of the series",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the episode",
    example: "https://example.com/episode1.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Status of the episode",
    enum: EpisodeStatus,
    example: EpisodeStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(EpisodeStatus)
  status?: EpisodeStatus;

  @ApiProperty({
    description: "Source type of the episode",
    enum: EpisodeSourceType,
    example: EpisodeSourceType.URL,
  })
  @IsEnum(EpisodeSourceType)
  source_type: EpisodeSourceType;

  @ApiProperty({
    description: "Source URL for the episode",
    example: "https://example.com/episode1.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === EpisodeSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Storage path for the episode",
    example: "/series/breaking-bad/s01e01.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === EpisodeSourceType.STORAGE)
  @IsOptional()
  @IsString()
  storage_path?: string;

  @ApiProperty({
    description: "Episode quality",
    enum: EpisodeQuality,
    example: EpisodeQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(EpisodeQuality)
  quality?: EpisodeQuality;

  @ApiProperty({
    description: "Episode resolution",
    enum: EpisodeResolution,
    example: EpisodeResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(EpisodeResolution)
  resolution?: EpisodeResolution;

  @ApiProperty({
    description: "Duration in minutes",
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: "Air date of the episode",
    example: "2008-01-20",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  air_date?: string;
}
