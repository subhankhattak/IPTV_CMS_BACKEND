import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum, MaxLength } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { CreateBouquetDto } from "./create-bouquet.dto";
import { BouquetRegion, BouquetStatus } from "../../entities/bouquet.entity";

export class UpdateBouquetDto extends PartialType(CreateBouquetDto) {
  @ApiProperty({
    description: "Name of the bouquet",
    example: "Premium Sports Package",
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: "Region for the bouquet",
    enum: BouquetRegion,
    example: BouquetRegion.NORTH_AMERICA,
    required: false,
  })
  @IsOptional()
  @IsEnum(BouquetRegion)
  region?: BouquetRegion;

  @ApiProperty({
    description: "Description of the bouquet",
    example: "Premium sports channels package for North America",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Status of the bouquet",
    enum: BouquetStatus,
    example: BouquetStatus.ENABLED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BouquetStatus)
  status?: BouquetStatus;
}
