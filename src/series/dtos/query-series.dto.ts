import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator";
import { Transform as ClassTransform } from "class-transformer";
import {
  SeriesStatus,
  SeriesSourceType,
  SeriesQuality,
  SeriesResolution,
} from "../../entities/series.entity";

export class QuerySeriesDto {
  @ApiProperty({
    description: "Search by series name",
    example: "Breaking",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Search by IMDB ID",
    example: "tt0903747",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "Search by TMDB ID",
    example: "1396",
    required: false,
  })
  @IsOptional()
  @IsString()
  tmdb_id?: string;

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
    description: "Filter by bouquet ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  bouquet_id?: string;

  @ApiProperty({
    description: "Filter by status",
    enum: SeriesStatus,
    example: SeriesStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesStatus)
  status?: SeriesStatus;

  @ApiProperty({
    description: "Filter by language",
    example: "English",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Filter by source type",
    enum: SeriesSourceType,
    example: SeriesSourceType.URL,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesSourceType)
  source_type?: SeriesSourceType;

  @ApiProperty({
    description: "Filter by quality",
    enum: SeriesQuality,
    example: SeriesQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesQuality)
  quality?: SeriesQuality;

  @ApiProperty({
    description: "Filter by resolution",
    enum: SeriesResolution,
    example: SeriesResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(SeriesResolution)
  resolution?: SeriesResolution;

  @ApiProperty({
    description: "Filter by added date (from)",
    example: "2024-01-01",
    required: false,
  })
  @IsOptional()
  @IsString()
  added_date_from?: string;

  @ApiProperty({
    description: "Filter by added date (to)",
    example: "2024-12-31",
    required: false,
  })
  @IsOptional()
  @IsString()
  added_date_to?: string;

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
  @ClassTransform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
    required: false,
  })
  @IsOptional()
  @ClassTransform(({ value }) => parseInt(value))
  limit?: number;
}
