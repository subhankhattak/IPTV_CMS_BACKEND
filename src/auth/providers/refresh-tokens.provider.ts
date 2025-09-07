import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { JwtService } from "@nestjs/jwt";
import JwtConfig from "../../config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { UsersService } from "../../users/providers/users.service";
import { GenerateTokensProvider } from "./generate-tokens.provider";
import { ActiveUserData } from "../interfaces/active-user-data.interface";

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    /**
     * Injecting JWT config
     */
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly generateTokenProviders: GenerateTokensProvider
  ) {}
  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    //verify the refresh token
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, "sub">
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfig.secret,
      });
      //get user from database
      const user = await this.userService.findOneById(sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      //generate the token
      return await this.generateTokenProviders.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
