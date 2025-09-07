import { IsOptional, IsString, IsBoolean, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

/**
 * Data Transfer Object (DTO) for querying sub-categories with filters.
 */
export class QuerySubCategoryDto {
  @ApiProperty({
    example: "Thriller",
    description: "Filter sub-categories by name (partial match)",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Filter sub-categories by category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({
    example: true,
    description: "Filter sub-categories by status",
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
