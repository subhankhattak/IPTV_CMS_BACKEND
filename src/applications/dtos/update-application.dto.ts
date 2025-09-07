import { PartialType } from "@nestjs/swagger";
import { CreateApplicationDto } from "./create-application.dto";

/**
 * Data Transfer Object (DTO) for updating an existing application.
 * Extends CreateApplicationDto with all fields optional.
 */
export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {}
