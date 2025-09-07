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
import { DramasService } from "./providers/dramas.service";
import { CreateDramaDto } from "./dtos/create-drama.dto";
import { UpdateDramaDto } from "./dtos/update-drama.dto";
import { QueryDramaDto } from "./dtos/query-drama.dto";
import { BulkDeleteDramasDto } from "./dtos/bulk-delete-dramas.dto";
import { CreateDramaEpisodeDto } from "./dtos/create-drama-episode.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { Drama } from "../entities/drama.entity";
import { DramaEpisode } from "../entities/drama-episode.entity";
import { DramaStatus } from "../entities/drama.entity";

import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { UserTypeEnum } from "../users/enums/userType.enum";

@ApiTags("Drama")
@ApiBearerAuth()
@Controller("dramas")
@UseGuards(RolesGuard)
export class DramasController {
  constructor(private readonly dramasService: DramasService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new drama" })
  @ApiResponse({
    status: 201,
    description: "Drama created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Drama) },
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
    description: "Conflict - drama with this ID already exists",
  })
  async create(
    @Body() createDramaDto: CreateDramaDto,
    @Request() req: any
  ): Promise<ResponseDto<Drama>> {
    return await this.dramasService.createDrama(
      createDramaDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ApiOperation({ summary: "Get all dramas with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Dramas retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Drama) },
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
    @Query() queryDto: QueryDramaDto,
    @Request() req: any
  ): Promise<ResponseDto<Drama[]>> {
    return await this.dramasService.getAllDramas(queryDto, req.user.userType);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a drama by ID" })
  @ApiResponse({
    status: 200,
    description: "Drama retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Drama) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Drama not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Drama>> {
    return await this.dramasService.getDramaById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a drama" })
  @ApiResponse({
    status: 200,
    description: "Drama updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Drama) },
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
  @ApiResponse({ status: 400, description: "Drama not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - drama with this ID already exists",
  })
  async update(
    @Param("id") id: string,
    @Body() updateDramaDto: UpdateDramaDto,
    @Request() req: any
  ): Promise<ResponseDto<Drama>> {
    return await this.dramasService.updateDrama(
      id,
      updateDramaDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a drama" })
  @ApiResponse({
    status: 200,
    description: "Drama deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Drama not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.dramasService.deleteDrama(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete dramas" })
  @ApiResponse({
    status: 200,
    description: "Dramas deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some dramas not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteDramasDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.dramasService.bulkDeleteDramas(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable dramas" })
  @ApiResponse({
    status: 200,
    description: "Drama statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some dramas not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.dramasService.bulkUpdateStatus(
      body.ids,
      DramaStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable dramas" })
  @ApiResponse({
    status: 200,
    description: "Drama statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some dramas not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.dramasService.bulkUpdateStatus(
      body.ids,
      DramaStatus.DISABLED,
      req.user.userType
    );
  }

  @Post(":id/assign-bouquets")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign bouquets to a drama" })
  @ApiResponse({
    status: 200,
    description: "Bouquets assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Drama) },
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
  @ApiResponse({ status: 400, description: "Drama not found" })
  async assignBouquets(
    @Param("id") id: string,
    @Body() body: { bouquet_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Drama>> {
    return await this.dramasService.assignBouquets(
      id,
      body.bouquet_ids,
      req.user.userType
    );
  }

  @Post(":id/assign-categories")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign categories to a drama" })
  @ApiResponse({
    status: 200,
    description: "Categories assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Drama) },
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
  @ApiResponse({ status: 400, description: "Drama not found" })
  async assignCategories(
    @Param("id") id: string,
    @Body() body: { category_id: string; sub_category_id: string },
    @Request() req: any
  ): Promise<ResponseDto<Drama>> {
    return await this.dramasService.assignCategories(
      id,
      body.category_id,
      body.sub_category_id,
      req.user.userType
    );
  }

  // Episode Management
  @Post(":dramaId/episodes")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new episode for a drama" })
  @ApiResponse({
    status: 201,
    description: "Episode created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(DramaEpisode) },
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
  @ApiResponse({ status: 400, description: "Drama not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - episode with this number already exists",
  })
  async createEpisode(
    @Param("dramaId") dramaId: string,
    @Body() createEpisodeDto: CreateDramaEpisodeDto,
    @Request() req: any
  ): Promise<ResponseDto<DramaEpisode>> {
    return await this.dramasService.createEpisode(
      dramaId,
      createEpisodeDto,
      req.user.userType
    );
  }

  @Get(":dramaId/episodes")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get all episodes for a drama" })
  @ApiResponse({
    status: 200,
    description: "Episodes retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(DramaEpisode) },
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
  async getEpisodes(
    @Param("dramaId") dramaId: string,
    @Request() req: any
  ): Promise<ResponseDto<DramaEpisode[]>> {
    return await this.dramasService.getEpisodes(dramaId, req.user.userType);
  }

  // Auto-ingestion
  @Post(":dramaId/auto-ingest")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("drama")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Start auto-ingestion for a drama" })
  @ApiResponse({
    status: 200,
    description: "Auto-ingestion started successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async autoIngest(
    @Param("dramaId") dramaId: string,
    @Body() body: { folder_path: string },
    @Request() req: any
  ): Promise<ResponseDto<any>> {
    return await this.dramasService.autoIngestEpisodes(
      dramaId,
      body.folder_path,
      req.user.userType
    );
  }
}
