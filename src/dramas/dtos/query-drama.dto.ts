import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator";
import { Transform as ClassTransform } from "class-transformer";
import {
  DramaStatus,
  DramaSourceType,
  DramaQuality,
  DramaResolution,
} from "../../entities/drama.entity";

export class QueryDramaDto {
  @ApiProperty({
    description: "Search by drama name",
    example: "Descendants",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Search by IMDB ID",
    example: "tt4925000",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "Search by TMDB ID",
    example: "65494",
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
    enum: DramaStatus,
    example: DramaStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaStatus)
  status?: DramaStatus;

  @ApiProperty({
    description: "Filter by language",
    example: "Korean",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Filter by source type",
    enum: DramaSourceType,
    example: DramaSourceType.URL,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaSourceType)
  source_type?: DramaSourceType;

  @ApiProperty({
    description: "Filter by quality",
    enum: DramaQuality,
    example: DramaQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaQuality)
  quality?: DramaQuality;

  @ApiProperty({
    description: "Filter by resolution",
    enum: DramaResolution,
    example: DramaResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaResolution)
  resolution?: DramaResolution;

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
