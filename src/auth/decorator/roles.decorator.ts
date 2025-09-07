import { SetMetadata } from "@nestjs/common";
import { UserTypeEnum } from "../../users/enums/userType.enum";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserTypeEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
