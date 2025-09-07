import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator";
import { Transform as ClassTransform } from "class-transformer";
import {
  MovieStatus,
  MovieSourceType,
  MovieQuality,
  MovieResolution,
} from "../../entities/movie.entity";

export class QueryMovieDto {
  @ApiProperty({
    description: "Search by movie name",
    example: "Matrix",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Search by IMDB ID",
    example: "tt0133093",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "Search by TMDB ID",
    example: "603",
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
    enum: MovieStatus,
    example: MovieStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

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
    enum: MovieSourceType,
    example: MovieSourceType.URL,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieSourceType)
  source_type?: MovieSourceType;

  @ApiProperty({
    description: "Filter by quality",
    enum: MovieQuality,
    example: MovieQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieQuality)
  quality?: MovieQuality;

  @ApiProperty({
    description: "Filter by resolution",
    enum: MovieResolution,
    example: MovieResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieResolution)
  resolution?: MovieResolution;

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
