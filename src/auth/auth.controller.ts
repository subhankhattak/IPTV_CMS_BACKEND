import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { LoginDto } from "./dtos/login.dto";
import { AuthService } from "./providers/auth.service";
import { Auth } from "./decorator/auth.decorator";
import { AuthType } from "./enum/auth-type.enum";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { CreateUserDto } from "../users/dtos/create-user.dto";
import { ForgetPasswordDto } from "./dtos/forget-password.dto";
import { VerifyOtpDto } from "./dtos/verify-otp.dto";
import { UpdatePasswordDto } from "./dtos/update-password.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    /**
     * Injecting User service
     */
    private readonly authService: AuthService
  ) {}

  /**
   * Registers a new user.
   * @param createUserDto - DTO containing user registration details.
   * @returns The created user.
   */
  @Post("register")
  @Auth(AuthType.None)
  @ApiResponse({ status: 201, description: "User registered successfully" })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  /**
   * Logs in a user.
   * @param loginUserDto - DTO containing user login details.
   * @returns A JWT token if login is successful.
   */

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async customerLignIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  /**
   * Logs in a user.
   * @param ForgetPasswordDto - DTO containing user phone number.
   */

  @Post("forget-password")
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgetPassword(forgetPasswordDto);
  }

  /**
   * Logs in a user.
   * @param loginUserDto - DTO containing user login details.
   * @returns A JWT token if login is successful.
   */

  @Post("verify-otp")
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(verifyOtpDto);
  }

  /**
   * Logs in a user.
   * @param  - DTO containing user login details.
   * @returns A JWT token if login is successful.
   */

  @Post("update-password")
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    return await this.authService.updatePassword(updatePasswordDto);
  }

  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  @ApiResponse({
    status: 200,
    description: "Tokens refreshed successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Tokens refreshed successfully" },
        data: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  public async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshTokens(refreshTokenDto);
  }
}
