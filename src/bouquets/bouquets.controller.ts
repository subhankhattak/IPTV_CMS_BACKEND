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
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  getSchemaPath,
} from "@nestjs/swagger";
import { BouquetsService } from "./providers/bouquets.service";
import { CreateBouquetDto } from "./dtos/create-bouquet.dto";
import { UpdateBouquetDto } from "./dtos/update-bouquet.dto";
import { QueryBouquetDto } from "./dtos/query-bouquet.dto";
import { BulkDeleteBouquetsDto } from "./dtos/bulk-delete-bouquets.dto";
import { MergeBouquetsDto } from "./dtos/merge-bouquets.dto";
import { Bouquet, BouquetStatus } from "../entities/bouquet.entity";
import { BouquetMergeLog } from "../entities/bouquet-merge-log.entity";
import { ResponseDto } from "../common/dtos/response.dto";
import { AuthenticationGuard } from "../auth/guards/authentication/authentication.guard";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";

@ApiTags("Bouquets")
@ApiBearerAuth()
@Controller("bouquets")
@UseGuards(RolesGuard)
export class BouquetsController {
  constructor(private readonly bouquetsService: BouquetsService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new bouquet (Super Admin only)" })
  @ApiResponse({
    status: 201,
    description: "Bouquet created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Bouquet) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - bouquet name already exists",
  })
  async create(
    @Body() createBouquetDto: CreateBouquetDto,
    @Request() req: any
  ): Promise<ResponseDto<Bouquet>> {
    return await this.bouquetsService.createBouquet(
      createBouquetDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ApiOperation({ summary: "Get all bouquets with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Bouquets retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Bouquet) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findAll(
    @Query() queryDto: QueryBouquetDto,
    @Request() req: any
  ): Promise<ResponseDto<Bouquet[]>> {
    return await this.bouquetsService.getAllBouquets(
      queryDto,
      req.user.userType
    );
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a specific bouquet by ID" })
  @ApiResponse({
    status: 200,
    description: "Bouquet retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Bouquet) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bouquet not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Bouquet>> {
    return await this.bouquetsService.getBouquetById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a bouquet (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquet updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Bouquet) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Bouquet not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - bouquet name already exists",
  })
  async update(
    @Param("id") id: string,
    @Body() updateBouquetDto: UpdateBouquetDto,
    @Request() req: any
  ): Promise<ResponseDto<Bouquet>> {
    return await this.bouquetsService.updateBouquet(
      id,
      updateBouquetDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a bouquet (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquet deleted successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { type: "null" },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Bouquet not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.bouquetsService.deleteBouquet(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete bouquets (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquets deleted successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { type: "null" },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some bouquets not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteBouquetsDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.bouquetsService.bulkDeleteBouquets(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable bouquets (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquet statuses updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { type: "null" },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some bouquets not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.bouquetsService.bulkUpdateStatus(
      body.ids,
      BouquetStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable bouquets (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquet statuses updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { type: "null" },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some bouquets not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.bouquetsService.bulkUpdateStatus(
      body.ids,
      BouquetStatus.DISABLED,
      req.user.userType
    );
  }

  @Post("merge")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Merge bouquets (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquets merged successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Bouquet) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some bouquets not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - bouquet name already exists",
  })
  async mergeBouquets(
    @Body() mergeDto: MergeBouquetsDto,
    @Request() req: any
  ): Promise<ResponseDto<Bouquet>> {
    return await this.bouquetsService.mergeBouquets(
      mergeDto,
      req.user.userType,
      req.user.sub
    );
  }

  @Get("merge-logs")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("bouquets")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get merge logs (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Merge logs retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(BouquetMergeLog) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async getMergeLogs(
    @Request() req: any
  ): Promise<ResponseDto<BouquetMergeLog[]>> {
    return await this.bouquetsService.getMergeLogs(req.user.userType);
  }
}
