import { Injectable } from "@nestjs/common";
import { loginDto } from "../dtos/signin.dto";
import { SignInProvider } from "./sign-in.provider";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";
import { RefreshTokensProvider } from "./refresh-tokens.provider";
import { CreateUserDto } from "../../users/dtos/create-user.dto";
import { RegisterProvider } from "./register.provider";
import { ForgetPasswordDto } from "../dtos/forget-password.dto";
import { ForgetPasswordProvider } from "./forget-password.provider";
import { VerifyOtpDto } from "../dtos/verify-otp.dto";
import { VerifyOtpProvider } from "./verify-otp.provider";
import { UpdatePasswordDto } from "../dtos/update-password.dto";
import { UpdatePasswordProvider } from "./update-password.provider";

@Injectable()
export class AuthService {
  constructor(
    private readonly signInProvider: SignInProvider,
    private readonly refreshTokensProvider: RefreshTokensProvider,
    private readonly registerProvider: RegisterProvider,
    private readonly forgetPasswordProvider: ForgetPasswordProvider,
    private readonly verifyOtpProvider: VerifyOtpProvider,
    private readonly updatePasswordProvider: UpdatePasswordProvider
  ) {}

  public async register(createUserDto: CreateUserDto) {
    const user = await this.registerProvider.register(createUserDto);
    return { message: "User Registered", data: user };
  }

  public async signIn(loginDto: loginDto) {
    const user = await this.signInProvider.signIn(loginDto);
    return { message: "User LoggedIn", data: user };
  }

  public async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    await this.forgetPasswordProvider.forgetPassword(forgetPasswordDto);
    return { message: "OTP send to your number" };
  }

  public async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    await this.verifyOtpProvider.verifyOTP(verifyOtpDto);
    return { message: "Your OTP verified" };
  }

  public async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    await this.updatePasswordProvider.updatePassword(updatePasswordDto);
    return { message: "Password updated" };
  }

  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const tokens =
      await this.refreshTokensProvider.refreshTokens(refreshTokenDto);
    return { message: "Tokens refreshed successfully", data: tokens };
  }
}
