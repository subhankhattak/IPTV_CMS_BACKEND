import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from "class-validator";
import { BouquetRegion, BouquetStatus } from "../../entities/bouquet.entity";

export class CreateBouquetDto {
  @ApiProperty({
    description: "Name of the bouquet",
    example: "Premium Sports Package",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: "Region for the bouquet",
    enum: BouquetRegion,
    example: BouquetRegion.NORTH_AMERICA,
  })
  @IsEnum(BouquetRegion)
  region: BouquetRegion;

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
