import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsArray,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UseForType } from "../../entities/category.entity";

/**
 * Data Transfer Object (DTO) for creating a new category.
 * Contains validation rules for incoming category data.
 */
export class CreateCategoryDto {
  @ApiProperty({
    example: "Action Movies",
    description: "Original name of the category",
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;

  @ApiProperty({
    example: ["movie", "vod"],
    description: "Types of content this category is used for",
    enum: UseForType,
    isArray: true,
  })
  @IsArray()
  @IsEnum(UseForType, { each: true })
  @IsNotEmpty()
  use_for: UseForType[];

  @ApiProperty({
    example: "Action",
    description: "Name to show on the application (optional)",
    required: false,
  })
  @IsOptional()
  @IsString()
  show_name_on_application?: string;

  @ApiProperty({
    example: "https://example.com/thumbnail.jpg",
    description: "URL to the category thumbnail",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiProperty({
    example: 1,
    description: "Order for sorting categories",
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiProperty({
    example: true,
    description: "Status of the category (active/inactive)",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
