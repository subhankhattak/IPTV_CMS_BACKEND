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
  DramaEpisodeStatus,
  DramaEpisodeSourceType,
  DramaEpisodeQuality,
  DramaEpisodeResolution,
} from "../../entities/drama-episode.entity";

export class CreateDramaEpisodeDto {
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
    example: "Episode 1",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Description of the episode",
    example: "The first episode of the drama",
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
    enum: DramaEpisodeStatus,
    example: DramaEpisodeStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaEpisodeStatus)
  status?: DramaEpisodeStatus;

  @ApiProperty({
    description: "Source type of the episode",
    enum: DramaEpisodeSourceType,
    example: DramaEpisodeSourceType.URL,
  })
  @IsEnum(DramaEpisodeSourceType)
  source_type: DramaEpisodeSourceType;

  @ApiProperty({
    description: "Source URL for the episode",
    example: "https://example.com/episode1.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === DramaEpisodeSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Storage path for the episode",
    example: "/dramas/descendants-of-the-sun/e01.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === DramaEpisodeSourceType.STORAGE)
  @IsOptional()
  @IsString()
  storage_path?: string;

  @ApiProperty({
    description: "Episode quality",
    enum: DramaEpisodeQuality,
    example: DramaEpisodeQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaEpisodeQuality)
  quality?: DramaEpisodeQuality;

  @ApiProperty({
    description: "Episode resolution",
    enum: DramaEpisodeResolution,
    example: DramaEpisodeResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaEpisodeResolution)
  resolution?: DramaEpisodeResolution;

  @ApiProperty({
    description: "Duration in minutes",
    example: 60,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiProperty({
    description: "Air date of the episode",
    example: "2016-02-24",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  air_date?: string;
}
