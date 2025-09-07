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
import { SubCategoriesService } from "./providers/sub-categories.service";
import { CreateSubCategoryDto } from "./dtos/create-sub-category.dto";
import { UpdateSubCategoryDto } from "./dtos/update-sub-category.dto";
import { QuerySubCategoryDto } from "./dtos/query-sub-category.dto";
import { SubCategory } from "../entities/sub-category.entity";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ResponseDto } from "../common/dtos/response.dto";

@Controller("sub-categories")
@ApiTags("Sub-Categories")
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Create a new sub-category" })
  @ApiResponse({
    status: 201,
    description: "Sub-category created successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 400, description: "Category not found" })
  @ApiResponse({ status: 409, description: "Sub-category name already exists" })
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto
  ): Promise<ResponseDto<SubCategory>> {
    return this.subCategoriesService.create(createSubCategoryDto);
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Get all sub-categories with optional filters" })
  @ApiResponse({
    status: 200,
    description: "Sub-categories retrieved successfully",
    type: ResponseDto,
  })
  async findAll(
    @Query() queryDto: QuerySubCategoryDto
  ): Promise<ResponseDto<SubCategory[]>> {
    return this.subCategoriesService.findAll(queryDto);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Get sub-category by ID" })
  @ApiResponse({
    status: 200,
    description: "Sub-category retrieved successfully",
    type: SubCategory,
  })
  @ApiResponse({ status: 400, description: "Sub-category not found" })
  findOne(@Param("id") id: string): Promise<SubCategory> {
    return this.subCategoriesService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Update sub-category by ID" })
  @ApiResponse({
    status: 200,
    description: "Sub-category updated successfully",
    type: SubCategory,
  })
  @ApiResponse({ status: 400, description: "Sub-category not found" })
  @ApiResponse({ status: 409, description: "Sub-category name already exists" })
  update(
    @Param("id") id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto
  ): Promise<SubCategory> {
    return this.subCategoriesService.update(id, updateSubCategoryDto);
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Delete sub-category by ID (soft delete)" })
  @ApiResponse({
    status: 200,
    description: "Sub-category deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Sub-category not found" })
  remove(@Param("id") id: string): Promise<void> {
    return this.subCategoriesService.remove(id);
  }

  @Get("category/:categoryId")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Get sub-categories by category ID" })
  @ApiResponse({
    status: 200,
    description: "Sub-categories retrieved successfully",
    type: [SubCategory],
  })
  findByCategoryId(
    @Param("categoryId") categoryId: string
  ): Promise<SubCategory[]> {
    return this.subCategoriesService.findByCategoryId(categoryId);
  }

  @Put(":id/order")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Update sub-category order" })
  @ApiResponse({
    status: 200,
    description: "Sub-category order updated successfully",
    type: SubCategory,
  })
  @ApiResponse({ status: 400, description: "Sub-category not found" })
  updateOrder(
    @Param("id") id: string,
    @Body() body: { order: number }
  ): Promise<SubCategory> {
    return this.subCategoriesService.updateOrder(id, body.order);
  }

  @Put("bulk/orders")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Bulk update sub-category orders" })
  @ApiResponse({
    status: 200,
    description: "Sub-category orders updated successfully",
  })
  bulkUpdateOrders(
    @Body() body: { orders: { id: string; order: number }[] }
  ): Promise<void> {
    return this.subCategoriesService.bulkUpdateOrders(body.orders);
  }

  @Delete("bulk/delete")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("sub-categories")
  @ApiOperation({ summary: "Bulk delete sub-categories" })
  @ApiResponse({
    status: 200,
    description: "Sub-categories deleted successfully",
  })
  bulkDelete(@Body() body: { ids: string[] }): Promise<void> {
    return this.subCategoriesService.bulkDelete(body.ids);
  }
}
