import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { UseForType } from "../../entities/category.entity";

/**
 * Data Transfer Object (DTO) for querying categories with filters.
 */
export class QueryCategoryDto {
  @ApiProperty({
    example: "Action",
    description: "Filter categories by name (partial match)",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: "movie",
    description: "Filter categories by use for type",
    required: false,
    enum: UseForType,
  })
  @IsOptional()
  @IsEnum(UseForType)
  use_for?: UseForType;

  @ApiProperty({
    example: true,
    description: "Filter categories by status",
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  @IsBoolean()
  status?: boolean;

  @ApiProperty({
    example: "order",
    description: "Sort field (original_name, order, created_at)",
    required: false,
    enum: ["original_name", "order", "created_at"],
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    example: "ASC",
    description: "Sort order",
    required: false,
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";
}
