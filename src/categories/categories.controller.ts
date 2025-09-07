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
import { CategoriesService } from "./providers/categories.service";
import { CreateCategoryDto } from "./dtos/create-category.dto";
import { UpdateCategoryDto } from "./dtos/update-category.dto";
import { QueryCategoryDto } from "./dtos/query-category.dto";
import { Category } from "../entities/category.entity";
import { Roles } from "../auth/decorator/roles.decorator";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ResponseDto } from "../common/dtos/response.dto";

@Controller("categories")
@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Create a new category" })
  @ApiResponse({
    status: 201,
    description: "Category created successfully",
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Category name already exists" })
  async create(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<ResponseDto<Category>> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Get all categories with optional filters" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: ResponseDto,
  })
  async findAll(
    @Query() queryDto: QueryCategoryDto
  ): Promise<ResponseDto<any[]>> {
    return this.categoriesService.findAll(queryDto);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Get category by ID" })
  @ApiResponse({
    status: 200,
    description: "Category retrieved successfully",
    type: Category,
  })
  @ApiResponse({ status: 400, description: "Category not found" })
  findOne(@Param("id") id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Update category by ID" })
  @ApiResponse({
    status: 200,
    description: "Category updated successfully",
    type: Category,
  })
  @ApiResponse({ status: 400, description: "Category not found" })
  @ApiResponse({ status: 409, description: "Category name already exists" })
  update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Delete category by ID (soft delete)" })
  @ApiResponse({ status: 200, description: "Category deleted successfully" })
  @ApiResponse({ status: 400, description: "Category not found" })
  remove(@Param("id") id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Get("use-for/:useFor")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Get categories by use for type" })
  @ApiResponse({
    status: 200,
    description: "Categories retrieved successfully",
    type: [Category],
  })
  findByUseFor(@Param("useFor") useFor: string): Promise<Category[]> {
    return this.categoriesService.findByUseFor(useFor);
  }

  @Put(":id/order")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Update category order" })
  @ApiResponse({
    status: 200,
    description: "Category order updated successfully",
    type: Category,
  })
  @ApiResponse({ status: 400, description: "Category not found" })
  updateOrder(
    @Param("id") id: string,
    @Body() body: { order: number }
  ): Promise<Category> {
    return this.categoriesService.updateOrder(id, body.order);
  }

  @Put("bulk/orders")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Bulk update category orders" })
  @ApiResponse({
    status: 200,
    description: "Category orders updated successfully",
  })
  bulkUpdateOrders(
    @Body() body: { orders: { id: string; order: number }[] }
  ): Promise<void> {
    return this.categoriesService.bulkUpdateOrders(body.orders);
  }

  @Delete("bulk/delete")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(AdminPermissionsGuard)
  @ModuleName("categories")
  @ApiOperation({ summary: "Bulk delete categories" })
  @ApiResponse({
    status: 200,
    description: "Categories deleted successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Cannot delete categories with linked sub-categories",
  })
  bulkDelete(@Body() body: { ids: string[] }): Promise<void> {
    return this.categoriesService.bulkDelete(body.ids);
  }
}
