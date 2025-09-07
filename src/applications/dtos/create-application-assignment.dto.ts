import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum AssignmentType {
  FREE = "FREE",
  PAID = "PAID",
  THEMED = "THEMED",
}

/**
 * Data Transfer Object (DTO) for creating application assignments.
 */
export class CreateApplicationAssignmentDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "ID of the application to assign",
  })
  @IsUUID()
  @IsNotEmpty()
  application_id: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174001",
    description: "ID of the reseller to assign the application to",
  })
  @IsUUID()
  @IsNotEmpty()
  reseller_id: string;

  @ApiProperty({
    example: "FREE",
    description: "Type of assignment (FREE, PAID, THEMED)",
    enum: AssignmentType,
  })
  @IsEnum(AssignmentType)
  @IsNotEmpty()
  assignment_type: AssignmentType;

  @ApiProperty({
    example: 29.99,
    description: "Price for paid assignments",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: "dark_theme",
    description: "Theme variant for themed assignments",
    required: false,
  })
  @IsOptional()
  @IsString()
  theme_variant?: string;

  @ApiProperty({
    example: true,
    description: "Status of the assignment",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
