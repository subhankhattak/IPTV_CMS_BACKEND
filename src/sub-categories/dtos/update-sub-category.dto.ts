import { PartialType } from "@nestjs/swagger";
import { CreateSubCategoryDto } from "./create-sub-category.dto";

/**
 * Data Transfer Object (DTO) for updating an existing sub-category.
 * Extends CreateSubCategoryDto with all fields optional.
 */
export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) {}
