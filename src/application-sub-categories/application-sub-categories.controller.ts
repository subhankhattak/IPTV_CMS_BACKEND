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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ApplicationSubCategoriesService } from "./providers/application-sub-categories.service";
import { CreateApplicationSubCategoryDto } from "./dtos/create-application-sub-category.dto";
import { UpdateApplicationSubCategoryDto } from "./dtos/update-application-sub-category.dto";
import { QueryApplicationSubCategoryDto } from "./dtos/query-application-sub-category.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { ApplicationSubCategory } from "../entities/application-sub-category.entity";
import { AuthenticationGuard } from "../auth/guards/authentication/authentication.guard";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";

@ApiTags("Application Sub-Categories")
@Controller("application-sub-categories")
@UseGuards(AuthenticationGuard, RolesGuard)
@ApiBearerAuth()
export class ApplicationSubCategoriesController {
  constructor(
    private readonly applicationSubCategoriesService: ApplicationSubCategoriesService
  ) {}

  @Post()
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({
    summary: "Create a new application-sub-category relationship",
  })
  @ApiResponse({
    status: 201,
    description: "Application-sub-category relationship created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Relationship already exists" })
  create(
    @Body() createApplicationSubCategoryDto: CreateApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory>> {
    return this.applicationSubCategoriesService.create(
      createApplicationSubCategoryDto
    );
  }

  @Get()
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({ summary: "Get all application-sub-category relationships" })
  @ApiResponse({
    status: 200,
    description:
      "Application-sub-category relationships retrieved successfully",
  })
  findAll(
    @Query() queryDto: QueryApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory[]>> {
    return this.applicationSubCategoriesService.findAll(queryDto);
  }

  @Get("application/:applicationId")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({ summary: "Get sub-categories for a specific application" })
  @ApiResponse({
    status: 200,
    description: "Sub-categories retrieved successfully",
  })
  getSubCategoriesByApplication(
    @Param("applicationId") applicationId: string
  ): Promise<any[]> {
    return this.applicationSubCategoriesService.getSubCategoriesByApplication(
      applicationId
    );
  }

  @Get("sub-category/:subCategoryId")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({ summary: "Get applications for a specific sub-category" })
  @ApiResponse({
    status: 200,
    description: "Applications retrieved successfully",
  })
  getApplicationsBySubCategory(
    @Param("subCategoryId") subCategoryId: string
  ): Promise<any[]> {
    return this.applicationSubCategoriesService.getApplicationsBySubCategory(
      subCategoryId
    );
  }

  @Get(":id")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({
    summary: "Get a specific application-sub-category relationship",
  })
  @ApiResponse({
    status: 200,
    description: "Application-sub-category relationship retrieved successfully",
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  findOne(
    @Param("id") id: string
  ): Promise<ResponseDto<ApplicationSubCategory>> {
    return this.applicationSubCategoriesService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({ summary: "Update an application-sub-category relationship" })
  @ApiResponse({
    status: 200,
    description: "Application-sub-category relationship updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Relationship already exists" })
  update(
    @Param("id") id: string,
    @Body() updateApplicationSubCategoryDto: UpdateApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory>> {
    return this.applicationSubCategoriesService.update(
      id,
      updateApplicationSubCategoryDto
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.ADMIN, UserTypeEnum.RESELLER)
  @ApiOperation({ summary: "Remove an application-sub-category relationship" })
  @ApiResponse({
    status: 200,
    description: "Application-sub-category relationship removed successfully",
  })
  @ApiResponse({ status: 400, description: "Relationship not found" })
  remove(@Param("id") id: string): Promise<ResponseDto<void>> {
    return this.applicationSubCategoriesService.remove(id);
  }
}
