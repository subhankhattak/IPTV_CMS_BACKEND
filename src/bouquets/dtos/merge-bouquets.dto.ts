import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
  MinLength,
} from "class-validator";
import { MergeAction } from "../../entities/bouquet-merge-log.entity";
import { CreateBouquetDto } from "./create-bouquet.dto";

export class MergeBouquetsDto {
  @ApiProperty({
    description: "Array of source bouquet IDs to merge",
    example: ["uuid1", "uuid2", "uuid3"],
    type: [String],
    minItems: 2,
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID("4", { each: true })
  source_ids: string[];

  @ApiProperty({
    description: "Target bouquet ID (existing) or null for new target",
    example: "uuid4",
    required: false,
  })
  @IsOptional()
  @IsUUID("4")
  target_id?: string;

  @ApiProperty({
    description: "New target bouquet details (if target_id is not provided)",
    required: false,
  })
  @ValidateIf((o) => !o.target_id)
  @IsOptional()
  new_target?: CreateBouquetDto;

  @ApiProperty({
    description: "Action to take on source bouquets after merge",
    enum: MergeAction,
    example: MergeAction.DISABLE,
  })
  @IsEnum(MergeAction)
  action: MergeAction;
}
