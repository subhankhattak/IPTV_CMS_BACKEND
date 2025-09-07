import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserTypeEnum } from "../../../users/enums/userType.enum";

@Injectable()
export class ResellerAccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userType) {
      throw new ForbiddenException(
        "User is not authenticated or role is undefined."
      );
    }

    // Only allow Reseller and Sub-Reseller roles
    if (
      user.userType === UserTypeEnum.RESELLER ||
      user.userType === UserTypeEnum.SUB_RESELLER
    ) {
      return true;
    }

    throw new ForbiddenException(
      "Only Reseller and Sub-Reseller can access this endpoint."
    );
  }
}
