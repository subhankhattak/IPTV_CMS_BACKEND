import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserTypeEnum } from "../../../users/enums/userType.enum";
import { AdminConfigService } from "../../../applications/providers/admin-config.service";

@Injectable()
export class AdminPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly adminConfigService: AdminConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userType) {
      throw new ForbiddenException(
        "User is not authenticated or role is undefined."
      );
    }

    // Super Admin has full access to everything
    if (user.userType === UserTypeEnum.SUPER_ADMIN) {
      return true;
    }

    // Admin needs to check permissions based on module configuration
    if (user.userType === UserTypeEnum.ADMIN) {
      const moduleName = this.reflector.get<string>(
        "moduleName",
        context.getHandler()
      );

      if (!moduleName) {
        throw new ForbiddenException(
          "Module name not specified for permission check."
        );
      }

      const httpMethod = request.method;
      const isWriteOperation = ["POST", "PUT", "PATCH", "DELETE"].includes(
        httpMethod
      );

      if (isWriteOperation) {
        const canCRUD = await this.adminConfigService.canAdminCRUD(moduleName);
        if (!canCRUD) {
          throw new ForbiddenException(
            "Admin does not have CRUD permissions for this module."
          );
        }
      } else {
        const isViewOnly =
          await this.adminConfigService.isAdminViewOnly(moduleName);
        if (!isViewOnly) {
          throw new ForbiddenException(
            "Admin does not have view permissions for this module."
          );
        }
      }

      return true;
    }

    // Reseller and Sub-Reseller access control
    if (
      user.userType === UserTypeEnum.RESELLER ||
      user.userType === UserTypeEnum.SUB_RESELLER
    ) {
      const url = request.url;
      const httpMethod = request.method;

      // Allow access to assigned applications endpoint
      if (httpMethod === "GET" && url.includes("/applications/assigned/")) {
        return true;
      }

      // Block access to management endpoints (only allow viewing content)
      if (
        url.includes("/applications") ||
        url.includes("/categories") ||
        url.includes("/sub-categories") ||
        url.includes("/users")
      ) {
        throw new ForbiddenException(
          "Reseller/Sub-Reseller cannot access management endpoints."
        );
      }

      // Allow read access to content endpoints, but block write operations
      if (
        url.includes("/bouquets") ||
        url.includes("/movies") ||
        url.includes("/series") ||
        url.includes("/dramas") ||
        url.includes("/streams") ||
        url.includes("/radios")
      ) {
        if (httpMethod !== "GET") {
          throw new ForbiddenException(
            "Reseller/Sub-Reseller can only view content, not modify it."
          );
        }
        // Allow GET requests to content endpoints
        return true;
      }
    }

    // User role access control
    if (user.userType === UserTypeEnum.USER) {
      const url = request.url;

      // Block access to all management endpoints
      if (
        url.includes("/applications/") ||
        url.includes("/categories/") ||
        url.includes("/sub-categories/")
      ) {
        throw new ForbiddenException(
          "Users cannot access management endpoints."
        );
      }
    }

    return true;
  }
}
