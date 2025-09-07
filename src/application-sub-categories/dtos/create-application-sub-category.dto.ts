import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object (DTO) for creating a new application-sub-category relationship.
 * Contains validation rules for incoming application-sub-category data.
 */
export class CreateApplicationSubCategoryDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID of the application",
  })
  @IsUUID()
  @IsNotEmpty()
  application_id: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174001",
    description: "ID of the sub-category",
  })
  @IsUUID()
  @IsNotEmpty()
  sub_category_id: string;

  @ApiProperty({
    example: "My Custom Sub-Category Name",
    description:
      "Custom alias for this sub-category in this application (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({
    example: 1,
    description: "Order for sorting sub-categories in this application",
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({
    example: true,
    description:
      "Status of the application-sub-category relationship (active/inactive)",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
