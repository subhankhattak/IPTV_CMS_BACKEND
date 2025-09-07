import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class BulkDeleteRadiosDto {
  @ApiProperty({
    description: "Array of radio station IDs to delete",
    example: ["uuid1", "uuid2", "uuid3"],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID("4", { each: true })
  ids: string[];
}
