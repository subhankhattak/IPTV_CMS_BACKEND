import { PartialType } from "@nestjs/swagger";
import { CreateApplicationCategoryDto } from "./create-application-category.dto";

/**
 * Data Transfer Object (DTO) for updating an application-category relationship.
 * Extends the create DTO with all fields optional.
 */
export class UpdateApplicationCategoryDto extends PartialType(
  CreateApplicationCategoryDto
) {}
