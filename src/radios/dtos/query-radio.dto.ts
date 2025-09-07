import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator";
import { Transform as ClassTransform } from "class-transformer";
import {
  RadioStatus,
  RadioSourceType,
  RadioQuality,
} from "../../entities/radio.entity";

export class QueryRadioDto {
  @ApiProperty({
    description: "Search by radio station name",
    example: "BBC",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

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
    enum: RadioStatus,
    example: RadioStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(RadioStatus)
  status?: RadioStatus;

  @ApiProperty({
    description: "Filter by language",
    example: "English",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Filter by country",
    example: "United Kingdom",
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: "Filter by source type",
    enum: RadioSourceType,
    example: RadioSourceType.URL,
    required: false,
  })
  @IsOptional()
  @IsEnum(RadioSourceType)
  source_type?: RadioSourceType;

  @ApiProperty({
    description: "Filter by quality",
    enum: RadioQuality,
    example: RadioQuality.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(RadioQuality)
  quality?: RadioQuality;

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
