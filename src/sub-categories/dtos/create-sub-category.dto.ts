import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object (DTO) for creating a new sub-category.
 * Contains validation rules for incoming sub-category data.
 */
export class CreateSubCategoryDto {
  @ApiProperty({
    example: "Action Thriller",
    description: "Original name of the sub-category",
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID of the parent category",
  })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({
    example: "Thriller",
    description: "Name to show on the application (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  show_name_on_application?: string;

  @ApiProperty({
    example: "High-intensity action thriller movies",
    description: "Description of the sub-category",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "https://example.com/thumbnail.jpg",
    description: "URL to the sub-category thumbnail",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiProperty({
    example: 1,
    description: "Order for sorting sub-categories within the category",
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({
    example: true,
    description: "Status of the sub-category (active/inactive)",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
