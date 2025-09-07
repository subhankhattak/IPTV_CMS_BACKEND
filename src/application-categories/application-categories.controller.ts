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
import { ApplicationCategoriesService } from "./providers/application-categories.service";
import { CreateApplicationCategoryDto } from "./dtos/create-application-category.dto";
import { UpdateApplicationCategoryDto } from "./dtos/update-application-category.dto";
import { QueryApplicationCategoryDto } from "./dtos/query-application-category.dto";
import { ApplicationCategory } from "../entities/application-category.entity";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ResponseDto } from "../common/dtos/response.dto";

@Controller("application-categories")
@ApiTags("Application Categories")
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class ApplicationCategoriesController {
  constructor(
    private readonly applicationCategoriesService: ApplicationCategoriesService
  ) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Create a new application-category relationship" })
  @ApiResponse({
    status: 201,
    description: "Application-category relationship created successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 400,
    description: "Application or category not found",
  })
  @ApiResponse({ status: 409, description: "Relationship already exists" })
  async create(
    @Body() createApplicationCategoryDto: CreateApplicationCategoryDto
  ): Promise<ResponseDto<ApplicationCategory>> {
    return this.applicationCategoriesService.create(
      createApplicationCategoryDto
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({
    summary: "Get all application-category relationships with filters",
  })
  @ApiResponse({
    status: 200,
    description: "List of application-category relationships",
    type: ResponseDto,
  })
  async findAll(
    @Query() queryDto: QueryApplicationCategoryDto
  ): Promise<ResponseDto<any[]>> {
    return this.applicationCategoriesService.findAll(queryDto);
  }

  @Get("application/:applicationId")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Get categories for a specific application" })
  @ApiResponse({
    status: 200,
    description: "List of categories for the application",
    type: [ApplicationCategory],
  })
  @ApiResponse({ status: 400, description: "Application not found" })
  getCategoriesByApplication(@Param("applicationId") applicationId: string) {
    return this.applicationCategoriesService.getCategoriesByApplication(
      applicationId
    );
  }

  @Get("category/:categoryId")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Get applications for a specific category" })
  @ApiResponse({
    status: 200,
    description: "List of applications for the category",
    type: [ApplicationCategory],
  })
  @ApiResponse({ status: 400, description: "Category not found" })
  getApplicationsByCategory(@Param("categoryId") categoryId: string) {
    return this.applicationCategoriesService.getApplicationsByCategory(
      categoryId
    );
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Get application-category relationship by ID" })
  @ApiResponse({
    status: 200,
    description: "Application-category relationship found",
    type: ApplicationCategory,
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  findOne(@Param("id") id: string) {
    return this.applicationCategoriesService.findOne(id);
  }

  @Put(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Update application-category relationship" })
  @ApiResponse({
    status: 200,
    description: "Application-category relationship updated successfully",
    type: ApplicationCategory,
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  @ApiResponse({ status: 409, description: "New relationship already exists" })
  update(
    @Param("id") id: string,
    @Body() updateApplicationCategoryDto: UpdateApplicationCategoryDto
  ) {
    return this.applicationCategoriesService.update(
      id,
      updateApplicationCategoryDto
    );
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({
    summary: "Partially update application-category relationship",
  })
  @ApiResponse({
    status: 200,
    description: "Application-category relationship updated successfully",
    type: ApplicationCategory,
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  @ApiResponse({ status: 409, description: "New relationship already exists" })
  patch(
    @Param("id") id: string,
    @Body() updateApplicationCategoryDto: UpdateApplicationCategoryDto
  ) {
    return this.applicationCategoriesService.update(
      id,
      updateApplicationCategoryDto
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("application-categories")
  @ApiOperation({ summary: "Remove application-category relationship" })
  @ApiResponse({
    status: 200,
    description: "Application-category relationship removed successfully",
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  remove(@Param("id") id: string) {
    return this.applicationCategoriesService.remove(id);
  }
}
