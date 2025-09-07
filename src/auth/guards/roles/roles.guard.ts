import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserTypeEnum } from "../../../users/enums/userType.enum";
import { ROLES_KEY } from "../../decorator/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserTypeEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      // No specific roles required for this route, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userType) {
      // User is not authenticated or userType is missing
      throw new ForbiddenException(
        "User is not authenticated or role is undefined."
      );
    }

    const hasRole = requiredRoles.includes(user.userType as UserTypeEnum);

    if (!hasRole) {
      throw new ForbiddenException("User does not have the required role.");
    }

    return hasRole;
  }
}
