import { Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ActiveUser } from "src/auth/decorator/active-user.decorator";
import { Auth } from "src/auth/decorator/auth.decorator";
import { AuthType } from "src/auth/enum/auth-type.enum";
import { ActiveUserData } from "src/auth/interfaces/active-user-data.interface";
import { Roles } from "src/auth/decorator/roles.decorator";
import { UserTypeEnum } from "src/users/enums/userType.enum";
import { UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/auth/guards/roles/roles.guard";

@ApiTags("Test")
@Controller("test")
export class TestController {
  @Post()
  set() {
    return { message: "Value set successfully" };
  }

  @ApiBearerAuth()
  @Get("get")
  @Auth(AuthType.Bearer)
  @Roles(UserTypeEnum.RESELLER)
  @UseGuards(RolesGuard)
  async get(@ActiveUser() user: ActiveUserData) {
    console.log(user);
    return {
      message: "Value retrieved successfully",
      data: { test: "this is test", user },
    };
  }
}
