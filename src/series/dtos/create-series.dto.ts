import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  IsDateString,
  ValidateIf,
} from "class-validator";
import {
  SeriesStatus,
  SeriesSourceType,
  SeriesQuality,
  SeriesResolution,
} from "../../entities/series.entity";

export class CreateSeriesDto {
  @ApiProperty({
    description: "Original name of the series",
    example: "Breaking Bad",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "Breaking Bad (2008)",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  show_app_name: string;

  @ApiProperty({
    description: "Description of the series",
    example:
      "A high school chemistry teacher turned methamphetamine manufacturer",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the series",
    example: "https://example.com/cover.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the series",
    example: "Crime, Drama",
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiProperty({
    description: "Cast of the series",
    example: "Bryan Cranston, Aaron Paul",
    required: false,
  })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiProperty({
    description: "Director of the series",
    example: "Vince Gilligan",
    required: false,
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({
    description: "Release date of the series",
    example: "2008-01-20",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty({
    description: "Language of the series",
    example: "English",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Status of the series",
    enum: SeriesStatus,
    example: SeriesStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesStatus)
  status?: SeriesStatus;

  @ApiProperty({
    description: "IMDB ID of the series",
    example: "tt0903747",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "TMDB ID of the series",
    example: "1396",
    required: false,
  })
  @IsOptional()
  @IsString()
  tmdb_id?: string;

  @ApiProperty({
    description: "Source type of the series",
    enum: SeriesSourceType,
    example: SeriesSourceType.URL,
  })
  @IsEnum(SeriesSourceType)
  source_type: SeriesSourceType;

  @ApiProperty({
    description: "Source URL for the series",
    example: "https://example.com/series",
    required: false,
  })
  @ValidateIf((o) => o.source_type === SeriesSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Server ID for storage",
    required: false,
  })
  @ValidateIf((o) => o.source_type === SeriesSourceType.STORAGE)
  @IsOptional()
  @IsUUID("4")
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the series",
    example: "/series/breaking-bad",
    required: false,
  })
  @ValidateIf((o) => o.source_type === SeriesSourceType.STORAGE)
  @IsOptional()
  @IsString()
  storage_path?: string;

  @ApiProperty({
    description: "Category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  category_id?: string;

  @ApiProperty({
    description: "Sub-category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  sub_category_id?: string;

  @ApiProperty({
    description: "Application ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  application_id?: string;

  @ApiProperty({
    description: "Series quality",
    enum: SeriesQuality,
    example: SeriesQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesQuality)
  quality?: SeriesQuality;

  @ApiProperty({
    description: "Series resolution",
    enum: SeriesResolution,
    example: SeriesResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesResolution)
  resolution?: SeriesResolution;

  @ApiProperty({
    description: "Array of bouquet IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  bouquet_ids?: string[];
}
