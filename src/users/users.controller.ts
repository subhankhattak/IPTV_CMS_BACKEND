import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  getSchemaPath,
} from "@nestjs/swagger";
import { UserManagementService } from "./providers/user-management.service";
import { CreateUserManagementDto } from "./dtos/create-user-management.dto";
import { UpdateUserManagementDto } from "./dtos/update-user-management.dto";
import { UserResponseDto } from "./dtos/user-response.dto";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { ModuleName } from "../auth/decorator/module-name.decorator";

import { UserTypeEnum } from "./enums/userType.enum";
import { ResponseDto } from "../common/dtos/response.dto";

@Controller("users")
@ApiTags("User Management")
@ApiBearerAuth()
@UseGuards(RolesGuard, AdminPermissionsGuard)
export class UsersController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  @ModuleName("users")
  @Roles(
    UserTypeEnum.SUPER_ADMIN,
    UserTypeEnum.ADMIN,
    UserTypeEnum.RESELLER,
    UserTypeEnum.SUB_RESELLER
  )
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: ResponseDto,
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(UserResponseDto),
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Email or phone already exists" })
  async create(
    @Body() createUserDto: CreateUserManagementDto,
    @Request() req: any
  ): Promise<ResponseDto<UserResponseDto>> {
    return this.userManagementService.createUser(
      createUserDto,
      req.user.userType
    );
  }

  @Get()
  @ModuleName("users")
  @Roles(
    UserTypeEnum.SUPER_ADMIN,
    UserTypeEnum.ADMIN,
    UserTypeEnum.RESELLER,
    UserTypeEnum.SUB_RESELLER
  )
  @ApiOperation({ summary: "Get all users (filtered by role hierarchy)" })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    type: ResponseDto,
  })
  async findAll(@Request() req: any): Promise<ResponseDto<UserResponseDto[]>> {
    return this.userManagementService.getAllUsers(req.user.userType);
  }

  @Get(":id")
  @ModuleName("users")
  @Roles(
    UserTypeEnum.SUPER_ADMIN,
    UserTypeEnum.ADMIN,
    UserTypeEnum.RESELLER,
    UserTypeEnum.SUB_RESELLER
  )
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "User not found" })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<UserResponseDto>> {
    return this.userManagementService.getUserById(id, req.user.userType);
  }

  @Patch(":id")
  @ModuleName("users")
  @Roles(
    UserTypeEnum.SUPER_ADMIN,
    UserTypeEnum.ADMIN,
    UserTypeEnum.RESELLER,
    UserTypeEnum.SUB_RESELLER
  )
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Super Admin protection rules violated",
  })
  @ApiResponse({ status: 400, description: "User not found" })
  @ApiResponse({ status: 409, description: "Email or phone already exists" })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserManagementDto,
    @Request() req: any
  ): Promise<ResponseDto<UserResponseDto>> {
    return this.userManagementService.updateUser(
      id,
      updateUserDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @ModuleName("users")
  @Roles(
    UserTypeEnum.SUPER_ADMIN,
    UserTypeEnum.ADMIN,
    UserTypeEnum.RESELLER,
    UserTypeEnum.SUB_RESELLER
  )
  @ApiOperation({ summary: "Delete user (soft delete)" })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully",
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Super Admin cannot be deleted",
  })
  @ApiResponse({ status: 400, description: "User not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return this.userManagementService.deleteUser(id, req.user.userType);
  }

  // Temporary endpoint to check and recreate super admin
  @Get("check-super-admin")
  @ApiOperation({ summary: "Check and recreate super admin if needed" })
  @ApiResponse({ status: 200, description: "Super admin status checked" })
  async checkSuperAdmin(): Promise<ResponseDto<any>> {
    await this.userManagementService.createDefaultSuperAdmin();
    return ResponseDto.success("Super admin check completed");
  }
}
