import { PartialType } from "@nestjs/swagger";
import { CreateApplicationSubCategoryDto } from "./create-application-sub-category.dto";

/**
 * Data Transfer Object (DTO) for updating an existing application-sub-category relationship.
 * Extends the create DTO with all fields optional for partial updates.
 */
export class UpdateApplicationSubCategoryDto extends PartialType(
  CreateApplicationSubCategoryDto
) {}
