import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import JwtConfig from "../../../config/jwt.config";
import { Request } from "express";
import { REQUEST_USER_KEY } from "../../constants/auth.constants";

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    /**
     * inject jwt service
     */
    private readonly jwtService: JwtService,
    /**
     * inject jwt config
     */
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //extract the request
    const request = context.switchToHttp().getRequest();
    //extract the token from header
    const token = this.extractRequestFromHeaders(request);
    //validate token
    if (!token) {
      throw new UnauthorizedException("Token is not valid");
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, this.jwtConfig);
      request[REQUEST_USER_KEY] = payload;
    } catch (error) {
      throw new UnauthorizedException("Token is not valid");
    }
    return true;
  }

  private extractRequestFromHeaders(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(" ") ?? [];
    return token;
  }
}
