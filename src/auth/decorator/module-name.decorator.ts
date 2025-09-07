import { SetMetadata } from "@nestjs/common";

export const MODULE_NAME_KEY = "moduleName";
export const ModuleName = (moduleName: string) =>
  SetMetadata(MODULE_NAME_KEY, moduleName);
