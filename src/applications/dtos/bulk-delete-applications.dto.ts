import { IsArray, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Data Transfer Object (DTO) for bulk deleting applications.
 */
export class BulkDeleteApplicationsDto {
  @ApiProperty({
    example: [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    ],
    description: "Array of application IDs to delete",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  ids: string[];
}
