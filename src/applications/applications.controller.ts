import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ApplicationsService } from "./providers/applications.service";
import { ApplicationAssignmentService } from "./providers/application-assignment.service";
import { AdminConfigService } from "./providers/admin-config.service";
import { CreateApplicationDto } from "./dtos/create-application.dto";
import { UpdateApplicationDto } from "./dtos/update-application.dto";
import { QueryApplicationDto } from "./dtos/query-application.dto";
import { BulkDeleteApplicationsDto } from "./dtos/bulk-delete-applications.dto";
import { CreateApplicationAssignmentDto } from "./dtos/create-application-assignment.dto";
import { Application } from "../entities/application.entity";
import { ApplicationAssignment } from "../entities/application-assignment.entity";
import { AdminConfig } from "../entities/admin-config.entity";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { ResellerAccessGuard } from "../auth/guards/reseller-access/reseller-access.guard";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ResponseDto } from "../common/dtos/response.dto";

@Controller("applications")
@ApiTags("Applications")
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly assignmentService: ApplicationAssignmentService,
    private readonly adminConfigService: AdminConfigService
  ) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Create a new application" })
  @ApiResponse({
    status: 201,
    description: "Application created successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Application name already exists" })
  async create(
    @Body() createApplicationDto: CreateApplicationDto
  ): Promise<ResponseDto<Application>> {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Get all applications with optional filters" })
  @ApiResponse({
    status: 200,
    description: "Applications retrieved successfully",
    type: ResponseDto,
  })
  async findAll(
    @Query() queryDto: QueryApplicationDto
  ): Promise<ResponseDto<Application[]>> {
    return this.applicationsService.findAll(queryDto);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Get application by ID" })
  @ApiResponse({
    status: 200,
    description: "Application retrieved successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Application not found" })
  async findOne(@Param("id") id: string): Promise<ResponseDto<Application>> {
    return this.applicationsService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Update application by ID" })
  @ApiResponse({
    status: 200,
    description: "Application updated successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Application not found" })
  @ApiResponse({ status: 409, description: "Application name already exists" })
  async update(
    @Param("id") id: string,
    @Body() updateApplicationDto: UpdateApplicationDto
  ): Promise<ResponseDto<Application>> {
    return this.applicationsService.update(id, updateApplicationDto);
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Delete application by ID (soft delete)" })
  @ApiResponse({
    status: 200,
    description: "Application deleted successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Application not found" })
  async remove(@Param("id") id: string): Promise<ResponseDto<void>> {
    return this.applicationsService.remove(id);
  }

  // Bulk Operations
  @Delete("bulk/delete")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Bulk delete applications" })
  @ApiResponse({
    status: 200,
    description: "Applications deleted successfully",
    type: ResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Cannot delete applications with active assignments",
  })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteApplicationsDto
  ): Promise<ResponseDto<void>> {
    return this.applicationsService.bulkDelete(bulkDeleteDto.ids);
  }

  @Put("bulk/status")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Bulk update application status" })
  @ApiResponse({
    status: 200,
    description: "Application status updated successfully",
    type: ResponseDto,
  })
  async bulkUpdateStatus(
    @Body() body: { ids: string[]; status: boolean }
  ): Promise<ResponseDto<void>> {
    return this.applicationsService.bulkUpdateStatus(body.ids, body.status);
  }

  // Reseller Access Endpoints
  @Get("assigned/:resellerId")
  @Roles(UserTypeEnum.RESELLER, UserTypeEnum.SUB_RESELLER)
  @UseGuards(ResellerAccessGuard)
  @ApiOperation({ summary: "Get applications assigned to a reseller" })
  @ApiResponse({
    status: 200,
    description: "Assigned applications retrieved successfully",
    type: ResponseDto,
  })
  async getAssignedApplications(
    @Param("resellerId") resellerId: string
  ): Promise<ResponseDto<Application[]>> {
    return this.assignmentService.getAssignedApplications(resellerId);
  }

  // Application Assignment Endpoints
  @Post("assign")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Assign application to reseller" })
  @ApiResponse({
    status: 201,
    description: "Application assigned successfully",
    type: ResponseDto,
  })
  async assignApplication(
    @Body() createAssignmentDto: CreateApplicationAssignmentDto
  ): Promise<ResponseDto<ApplicationAssignment>> {
    return this.assignmentService.create(createAssignmentDto);
  }

  @Get("assignments/:applicationId")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Get all assignments for an application" })
  @ApiResponse({
    status: 200,
    description: "Application assignments retrieved successfully",
    type: ResponseDto,
  })
  async getApplicationAssignments(
    @Param("applicationId") applicationId: string
  ): Promise<ResponseDto<ApplicationAssignment[]>> {
    return this.assignmentService.getApplicationAssignments(applicationId);
  }

  @Delete("assignments/:assignmentId")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Remove application assignment" })
  @ApiResponse({
    status: 200,
    description: "Assignment removed successfully",
    type: ResponseDto,
  })
  async removeAssignment(
    @Param("assignmentId") assignmentId: string
  ): Promise<ResponseDto<void>> {
    return this.assignmentService.removeAssignment(assignmentId);
  }

  // Admin Configuration Endpoints
  @Get("admin-config/:moduleName")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Get admin configuration for a module" })
  @ApiResponse({
    status: 200,
    description: "Admin configuration retrieved successfully",
    type: ResponseDto,
  })
  async getAdminConfig(
    @Param("moduleName") moduleName: string
  ): Promise<ResponseDto<AdminConfig | null>> {
    const config = await this.adminConfigService.getModuleConfig(moduleName);
    return ResponseDto.success(
      "Admin configuration retrieved successfully",
      config
    );
  }

  @Put("admin-config/:moduleName")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("applications")
  @ApiOperation({ summary: "Update admin configuration for a module" })
  @ApiResponse({
    status: 200,
    description: "Admin configuration updated successfully",
    type: ResponseDto,
  })
  async updateAdminConfig(
    @Param("moduleName") moduleName: string,
    @Body() body: { allowAdminCRUD: boolean; adminViewOnly: boolean }
  ): Promise<ResponseDto<AdminConfig>> {
    const config = await this.adminConfigService.updateModuleConfig(
      moduleName,
      body.allowAdminCRUD,
      body.adminViewOnly
    );
    return ResponseDto.success(
      "Admin configuration updated successfully",
      config
    );
  }
}
