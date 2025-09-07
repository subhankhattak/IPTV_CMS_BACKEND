import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";
import { BouquetRegion, BouquetStatus } from "../../entities/bouquet.entity";

export class QueryBouquetDto {
  @ApiProperty({
    description: "Search by bouquet name",
    example: "Sports",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: "Filter by region",
    enum: BouquetRegion,
    example: BouquetRegion.NORTH_AMERICA,
    required: false,
  })
  @IsOptional()
  @IsEnum(BouquetRegion)
  region?: BouquetRegion;

  @ApiProperty({
    description: "Filter by status",
    enum: BouquetStatus,
    example: BouquetStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BouquetStatus)
  status?: BouquetStatus;

  @ApiProperty({
    description: "Sort by field",
    example: "name",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "Sort order",
    example: "ASC",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";

  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({
    description: "Items per page",
    example: 10,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
