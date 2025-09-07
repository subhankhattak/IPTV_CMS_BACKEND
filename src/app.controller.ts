import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "./auth/decorator/auth.decorator";
import { AuthType } from "./auth/enum/auth-type.enum";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags("Health Check")
  @Auth(AuthType.None)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
