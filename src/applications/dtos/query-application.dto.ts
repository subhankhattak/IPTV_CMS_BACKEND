import { IsOptional, IsString, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

/**
 * Data Transfer Object (DTO) for querying applications with filters.
 */
export class QueryApplicationDto {
  @ApiProperty({
    example: "IPTV",
    description: "Filter applications by name (partial match)",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: true,
    description: "Filter applications by status",
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
    example: "name",
    description: "Sort field (name, created_at)",
    required: false,
    enum: ["name", "created_at"],
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
