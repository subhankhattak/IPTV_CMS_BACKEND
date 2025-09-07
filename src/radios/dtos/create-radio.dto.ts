import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  IsInt,
  IsNumber,
  ValidateIf,
  Min,
} from "class-validator";
import {
  RadioStatus,
  RadioSourceType,
  RadioQuality,
} from "../../entities/radio.entity";

export class CreateRadioDto {
  @ApiProperty({
    description: "Original name of the radio station",
    example: "BBC Radio 1",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "BBC Radio 1 (UK)",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  show_app_name: string;

  @ApiProperty({
    description: "Description of the radio station",
    example: "The UK's most popular pop music station",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the radio station",
    example: "https://example.com/radio1.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the radio station",
    example: "Pop, Rock, Electronic",
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiProperty({
    description: "Language of the radio station",
    example: "English",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Country of the radio station",
    example: "United Kingdom",
    required: false,
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({
    description: "Status of the radio station",
    enum: RadioStatus,
    example: RadioStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(RadioStatus)
  status?: RadioStatus;

  @ApiProperty({
    description: "Source type of the radio station",
    enum: RadioSourceType,
    example: RadioSourceType.URL,
  })
  @IsEnum(RadioSourceType)
  source_type: RadioSourceType;

  @ApiProperty({
    description: "Source URL for the radio station",
    example: "https://stream.radio1.com/live",
    required: false,
  })
  @ValidateIf((o) => o.source_type === RadioSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Server ID for storage",
    required: false,
  })
  @ValidateIf((o) => o.source_type === RadioSourceType.STORAGE)
  @IsOptional()
  @IsUUID("4")
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the radio station",
    example: "/radios/bbc-radio1.mp3",
    required: false,
  })
  @ValidateIf((o) => o.source_type === RadioSourceType.STORAGE)
  @IsOptional()
  @IsString()
  storage_path?: string;

  @ApiProperty({
    description: "Category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  category_id?: string;

  @ApiProperty({
    description: "Sub-category ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  sub_category_id?: string;

  @ApiProperty({
    description: "Application ID",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  application_id?: string;

  @ApiProperty({
    description: "Radio quality",
    enum: RadioQuality,
    example: RadioQuality.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(RadioQuality)
  quality?: RadioQuality;

  @ApiProperty({
    description: "Bitrate in kbps",
    example: 128,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  bitrate?: number;

  @ApiProperty({
    description: "Frequency in MHz",
    example: 98.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  frequency?: number;

  @ApiProperty({
    description: "Website URL of the radio station",
    example: "https://www.bbc.co.uk/radio1",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website_url?: string;

  @ApiProperty({
    description: "Array of bouquet IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  bouquet_ids?: string[];
}
