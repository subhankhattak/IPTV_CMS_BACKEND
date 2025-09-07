import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsUrl,
  Min,
} from "class-validator";
import { SeasonStatus } from "../../entities/season.entity";

export class CreateSeasonDto {
  @ApiProperty({
    description: "Season number",
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  season_number: number;

  @ApiProperty({
    description: "Season name",
    example: "Season 1",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Description of the season",
    example: "The first season of the series",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Cover URL for the season",
    example: "https://example.com/season1.jpg",
    required: false,
  })
  @IsOptional()
  @IsUrl()
  cover_url?: string;

  @ApiProperty({
    description: "Status of the season",
    enum: SeasonStatus,
    example: SeasonStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;
}
