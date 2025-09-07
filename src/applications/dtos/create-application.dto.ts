import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object (DTO) for creating a new application.
 * Contains validation rules for incoming application data.
 */
export class CreateApplicationDto {
  @ApiProperty({
    example: "IPTV App Pro",
    description: "Name of the application (must be unique)",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: "https://example.com/logo.png",
    description: "URL to the application logo",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo_path?: string;

  @ApiProperty({
    example: "IPTVApp/1.0 (iOS; iPhone; Version 15.0)",
    description: "User agent string to identify app requests",
  })
  @IsString()
  @IsNotEmpty()
  user_agent: string;

  @ApiProperty({
    example: "Premium IPTV application with advanced features",
    description: "Description of the application purpose/theme",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "dark",
    description: "Theme of the application",
    required: false,
  })
  @IsOptional()
  @IsString()
  theme?: string;

  @ApiProperty({
    example: "#1a1a1a,#ffffff,#007bff",
    description: "Color scheme of the application",
    required: false,
  })
  @IsOptional()
  @IsString()
  color_scheme?: string;

  @ApiProperty({
    example: true,
    description: "Status of the application (active/inactive)",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
