import { Inject, Injectable } from "@nestjs/common";
import JwtConfig from "../../config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ActiveUserData } from "../interfaces/active-user-data.interface";
// import { User } from '../users/user.entity';

@Injectable()
export class GenerateTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    /**
     * Injecting JWT config
     */
    @Inject(JwtConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof JwtConfig>
  ) {}
  public async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    const token = await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        secret: this.jwtConfig.secret,
        expiresIn: expiresIn,
      }
    );
    return token;
  }

  // public async generateTokens(user: User) {
  public async generateTokens(user: any) {
    //generate access token
    const payload = {
      userType: user.user_type, // Fix: use user_type instead of userType
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfig.accessTokenTtl,
        payload
      ),
      //generate refresh token
      this.signToken(user.id, this.jwtConfig.refreshTokenTtl),
    ]);

    return { accessToken, refreshToken };
  }
}
