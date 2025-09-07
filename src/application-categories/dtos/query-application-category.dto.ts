import { IsOptional, IsString, IsBoolean, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

/**
 * Data Transfer Object (DTO) for querying application-category relationships with filters.
 */
export class QueryApplicationCategoryDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Filter by application ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  application_id?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174001",
    description: "Filter by category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({
    example: "My Custom Name",
    description: "Filter by alias (partial match)",
    required: false,
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    example: true,
    description: "Filter by status",
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
    description: "Sort field (order, created_at)",
    required: false,
    enum: ["order", "created_at"],
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
