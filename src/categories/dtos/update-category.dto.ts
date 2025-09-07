import { PartialType } from "@nestjs/swagger";
import { CreateCategoryDto } from "./create-category.dto";

/**
 * Data Transfer Object (DTO) for updating an existing category.
 * Extends CreateCategoryDto with all fields optional.
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
