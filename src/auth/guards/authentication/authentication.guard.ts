import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../../guards/access-token/access-token.guard';
import { AuthType } from '../../enum/auth-type.enum';
import { AUTH_TYPE_KEY } from '../../constants/auth.constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  //default auth type
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]> = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    /**
     * reflector dependency injection
     */
    private readonly reflector: Reflector,
    /**
     * Access token guard
     */
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //get auth type from reflector
    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(), //for method
      context.getClass(), //for class
    ]) ?? [AuthenticationGuard.defaultAuthType];
    //array of guard
    const guards = authTypes.map((type: string) => this.authTypeGuardMap[type]).flat();

    //Default error
    const error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(instance.canActivate(context)).catch(error => {
        error;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
