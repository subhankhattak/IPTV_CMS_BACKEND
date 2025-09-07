import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsUrl,
  IsDateString,
  ValidateIf,
} from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { CreateMovieDto } from "./create-movie.dto";
import {
  MovieStatus,
  MovieSourceType,
  MovieQuality,
  MovieResolution,
} from "../../entities/movie.entity";

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @ApiProperty({
    description: "Original name of the movie",
    example: "The Matrix",
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  original_name?: string;

  @ApiProperty({
    description: "Name to show in applications",
    example: "The Matrix (1999)",
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  show_app_name?: string;

  @ApiProperty({
    description: "Description of the movie",
    example:
      "A computer hacker learns from mysterious rebels about the true nature of his reality",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the movie",
    example: "https://example.com/cover.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Genres of the movie",
    example: "Action, Sci-Fi",
    required: false,
  })
  @IsOptional()
  @IsString()
  genres?: string;

  @ApiProperty({
    description: "Cast of the movie",
    example: "Keanu Reeves, Laurence Fishburne",
    required: false,
  })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiProperty({
    description: "Director of the movie",
    example: "Lana Wachowski",
    required: false,
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({
    description: "Release date of the movie",
    example: "1999-03-31",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  release_date?: string;

  @ApiProperty({
    description: "Language of the movie",
    example: "English",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Status of the movie",
    enum: MovieStatus,
    example: MovieStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;

  @ApiProperty({
    description: "IMDB ID of the movie",
    example: "tt0133093",
    required: false,
  })
  @IsOptional()
  @IsString()
  imdb_id?: string;

  @ApiProperty({
    description: "TMDB ID of the movie",
    example: "603",
    required: false,
  })
  @IsOptional()
  @IsString()
  tmdb_id?: string;

  @ApiProperty({
    description: "Source type of the movie",
    enum: MovieSourceType,
    example: MovieSourceType.URL,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieSourceType)
  source_type?: MovieSourceType;

  @ApiProperty({
    description: "Source URL for the movie",
    example: "https://example.com/movie.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === MovieSourceType.URL)
  @IsOptional()
  @IsUrl()
  source_url?: string;

  @ApiProperty({
    description: "Server ID for storage",
    required: false,
  })
  @ValidateIf((o) => o.source_type === MovieSourceType.STORAGE)
  @IsOptional()
  @IsUUID("4")
  server_id?: string;

  @ApiProperty({
    description: "Storage path for the movie",
    example: "/movies/matrix.mp4",
    required: false,
  })
  @ValidateIf((o) => o.source_type === MovieSourceType.STORAGE)
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
    description: "Movie quality",
    enum: MovieQuality,
    example: MovieQuality.HD,
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieQuality)
  quality?: MovieQuality;

  @ApiProperty({
    description: "Movie resolution",
    enum: MovieResolution,
    example: MovieResolution["1080p"],
    required: false,
  })
  @IsOptional()
  @IsEnum(MovieResolution)
  resolution?: MovieResolution;

  @ApiProperty({
    description: "Array of bouquet IDs",
    example: ["uuid1", "uuid2"],
    required: false,
  })
  @IsOptional()
  @IsUUID("4", { each: true })
  bouquet_ids?: string[];
}
