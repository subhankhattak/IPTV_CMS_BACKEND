import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";

export enum MetadataSource {
  IMDB = "imdb",
  TMDB = "tmdb",
}

export class FetchMetadataDto {
  @ApiProperty({
    description: "Source for metadata fetch",
    enum: MetadataSource,
    example: MetadataSource.IMDB,
  })
  @IsEnum(MetadataSource)
  source: MetadataSource;

  @ApiProperty({
    description: "ID from the source (IMDB ID or TMDB ID)",
    example: "tt0903747",
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
