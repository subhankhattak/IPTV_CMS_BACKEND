import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  IsDateString,
  ValidateIf,
} from "class-validator";
import {
  DramaStatus,
  DramaSourceType,
  DramaQuality,
  DramaResolution,
} from "../../entities/drama.entity";

export class CreateDramaDto {
  @ApiProperty({
    description: "Original name of the drama",
    example: "Descendants of the Sun",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  original_name: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "Descendants of the Sun (2016)",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  show_app_name: string;

  @ApiProperty({
    description: "Description of the drama",
    example: "A love story between a soldier and a doctor",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the drama",
    example: "https://example.com/cover.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the drama",
    example: "Romance, Action",
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiProperty({
    description: "Cast of the drama",
    example: "Song Joong-ki, Song Hye-kyo",
    required: false,
  })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiProperty({
    description: "Director of the drama",
    example: "Lee Eung-bok",
    required: false,
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({
    description: "Release date of the drama",
    example: "2016-02-24",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty({
    description: "Language of the drama",
    example: "Korean",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Status of the drama",
    enum: DramaStatus,
    example: DramaStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaStatus)
  status?: DramaStatus;

  @ApiProperty({
    description: "IMDB ID of the drama",
    example: "tt4925000",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "TMDB ID of the drama",
    example: "65494",
    required: false,
  })
  @IsOptional()
  @IsString()
  tmdb_id?: string;

  @ApiProperty({
    description: "Source type of the drama",
    enum: DramaSourceType,
    example: DramaSourceType.URL,
  })
  @IsEnum(DramaSourceType)
  source_type: DramaSourceType;

  @ApiProperty({
    description: "Source URL for the drama",
    example: "https://example.com/drama",
    required: false,
  })
  @ValidateIf((o) => o.source_type === DramaSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Server ID for storage",
    required: false,
  })
  @ValidateIf((o) => o.source_type === DramaSourceType.STORAGE)
  @IsOptional()
  @IsUUID("4")
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the drama",
    example: "/dramas/descendants-of-the-sun",
    required: false,
  })
  @ValidateIf((o) => o.source_type === DramaSourceType.STORAGE)
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
    description: "Drama quality",
    enum: DramaQuality,
    example: DramaQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaQuality)
  quality?: DramaQuality;

  @ApiProperty({
    description: "Drama resolution",
    enum: DramaResolution,
    example: DramaResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(DramaResolution)
  resolution?: DramaResolution;

  @ApiProperty({
    description: "Array of bouquet IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  bouquet_ids?: string[];
}
