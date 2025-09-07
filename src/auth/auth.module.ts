import { forwardRef, Module } from "@nestjs/common";
import { HashingProvider } from "./providers/hashing.provider";
import { BcryptProvider } from "./providers/bcrypt.provider";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { GenerateTokensProvider } from "./providers/generate-tokens.provider";
import { RefreshTokensProvider } from "./providers/refresh-tokens.provider";
import { AuthService } from "./providers/auth.service";
import jwtConfig from "../config/jwt.config";
import { JwtModule } from "@nestjs/jwt";
import { SignInProvider } from "./providers/sign-in.provider";
import { ConfigModule } from "@nestjs/config";
import { RegisterProvider } from "./providers/register.provider";
import { ForgetPasswordProvider } from "./providers/forget-password.provider";
import { VerifyOtpProvider } from "./providers/verify-otp.provider";
import { UpdatePasswordProvider } from "./providers/update-password.provider";
import { AccessTokenGuard } from "./guards/access-token/access-token.guard";
import { AuthenticationGuard } from "./guards/authentication/authentication.guard";

@Module({
  controllers: [AuthController],

  providers: [
    AuthService,
    { provide: HashingProvider, useClass: BcryptProvider },
    SignInProvider,
    GenerateTokensProvider,
    RefreshTokensProvider,
    RegisterProvider,
    ForgetPasswordProvider,
    VerifyOtpProvider,
    UpdatePasswordProvider,
    AccessTokenGuard,
    AuthenticationGuard,
  ],

  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  exports: [
    { provide: HashingProvider, useClass: BcryptProvider },
    AuthService,
    AccessTokenGuard,
    AuthenticationGuard,
  ],
})
export class AuthModule {}
