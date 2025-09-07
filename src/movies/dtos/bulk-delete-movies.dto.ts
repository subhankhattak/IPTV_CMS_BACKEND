import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class BulkDeleteMoviesDto {
  @ApiProperty({
    description: "Array of movie IDs to delete",
    example: ["uuid1", "uuid2", "uuid3"],
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID("4", { each: true })
  ids: string[];
}
