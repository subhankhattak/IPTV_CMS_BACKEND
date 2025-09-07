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
import { SeriesService } from "./providers/series.service";
import { CreateSeriesDto } from "./dtos/create-series.dto";
import { UpdateSeriesDto } from "./dtos/update-series.dto";
import { QuerySeriesDto } from "./dtos/query-series.dto";
import { BulkDeleteSeriesDto } from "./dtos/bulk-delete-series.dto";
import { FetchMetadataDto } from "./dtos/fetch-metadata.dto";
import { CreateSeasonDto } from "./dtos/create-season.dto";
import { CreateEpisodeDto } from "./dtos/create-episode.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { Series } from "../entities/series.entity";
import { Season } from "../entities/season.entity";
import { Episode } from "../entities/episode.entity";
import { SeriesStatus } from "../entities/series.entity";

import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { UserTypeEnum } from "../users/enums/userType.enum";

@ApiTags("Series")
@ApiBearerAuth()
@Controller("series")
@UseGuards(RolesGuard)
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new series" })
  @ApiResponse({
    status: 201,
    description: "Series created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Series) },
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
    description: "Conflict - series with this ID already exists",
  })
  async create(
    @Body() createSeriesDto: CreateSeriesDto,
    @Request() req: any
  ): Promise<ResponseDto<Series>> {
    return await this.seriesService.createSeries(
      createSeriesDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ApiOperation({ summary: "Get all series with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Series retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Series) },
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
    @Query() queryDto: QuerySeriesDto,
    @Request() req: any
  ): Promise<ResponseDto<Series[]>> {
    return await this.seriesService.getAllSeries(queryDto, req.user.userType);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a series by ID" })
  @ApiResponse({
    status: 200,
    description: "Series retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Series) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Series not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Series>> {
    return await this.seriesService.getSeriesById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a series" })
  @ApiResponse({
    status: 200,
    description: "Series updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Series) },
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
  @ApiResponse({ status: 400, description: "Series not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - series with this ID already exists",
  })
  async update(
    @Param("id") id: string,
    @Body() updateSeriesDto: UpdateSeriesDto,
    @Request() req: any
  ): Promise<ResponseDto<Series>> {
    return await this.seriesService.updateSeries(
      id,
      updateSeriesDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a series" })
  @ApiResponse({
    status: 200,
    description: "Series deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Series not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.seriesService.deleteSeries(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete series" })
  @ApiResponse({
    status: 200,
    description: "Series deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some series not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteSeriesDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.seriesService.bulkDeleteSeries(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable series" })
  @ApiResponse({
    status: 200,
    description: "Series statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some series not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.seriesService.bulkUpdateStatus(
      body.ids,
      SeriesStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable series" })
  @ApiResponse({
    status: 200,
    description: "Series statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some series not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.seriesService.bulkUpdateStatus(
      body.ids,
      SeriesStatus.DISABLED,
      req.user.userType
    );
  }

  @Post("fetch-metadata")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Fetch metadata from IMDB/TMDB" })
  @ApiResponse({
    status: 200,
    description: "Metadata fetched successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - failed to fetch metadata",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async fetchMetadata(
    @Body() fetchMetadataDto: FetchMetadataDto,
    @Request() req: any
  ): Promise<ResponseDto<any>> {
    return await this.seriesService.fetchMetadata(
      fetchMetadataDto,
      req.user.userType
    );
  }

  @Post(":id/assign-bouquets")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign bouquets to a series" })
  @ApiResponse({
    status: 200,
    description: "Bouquets assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Series) },
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
  @ApiResponse({ status: 400, description: "Series not found" })
  async assignBouquets(
    @Param("id") id: string,
    @Body() body: { bouquet_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Series>> {
    return await this.seriesService.assignBouquets(
      id,
      body.bouquet_ids,
      req.user.userType
    );
  }

  @Post(":id/assign-categories")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign categories to a series" })
  @ApiResponse({
    status: 200,
    description: "Categories assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Series) },
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
  @ApiResponse({ status: 400, description: "Series not found" })
  async assignCategories(
    @Param("id") id: string,
    @Body() body: { category_id: string; sub_category_id: string },
    @Request() req: any
  ): Promise<ResponseDto<Series>> {
    return await this.seriesService.assignCategories(
      id,
      body.category_id,
      body.sub_category_id,
      req.user.userType
    );
  }

  // Season Management
  @Post(":seriesId/seasons")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new season for a series" })
  @ApiResponse({
    status: 201,
    description: "Season created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Season) },
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
  @ApiResponse({ status: 400, description: "Series not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - season with this number already exists",
  })
  async createSeason(
    @Param("seriesId") seriesId: string,
    @Body() createSeasonDto: CreateSeasonDto,
    @Request() req: any
  ): Promise<ResponseDto<Season>> {
    return await this.seriesService.createSeason(
      seriesId,
      createSeasonDto,
      req.user.userType
    );
  }

  @Get(":seriesId/seasons")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get all seasons for a series" })
  @ApiResponse({
    status: 200,
    description: "Seasons retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Season) },
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
  async getSeasons(
    @Param("seriesId") seriesId: string,
    @Request() req: any
  ): Promise<ResponseDto<Season[]>> {
    return await this.seriesService.getSeasons(seriesId, req.user.userType);
  }

  // Episode Management
  @Post("seasons/:seasonId/episodes")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new episode for a season" })
  @ApiResponse({
    status: 201,
    description: "Episode created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Episode) },
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
  @ApiResponse({ status: 400, description: "Season not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - episode with this number already exists",
  })
  async createEpisode(
    @Param("seasonId") seasonId: string,
    @Body() createEpisodeDto: CreateEpisodeDto,
    @Request() req: any
  ): Promise<ResponseDto<Episode>> {
    return await this.seriesService.createEpisode(
      seasonId,
      createEpisodeDto,
      req.user.userType
    );
  }

  @Get("seasons/:seasonId/episodes")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get all episodes for a season" })
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
              items: { $ref: getSchemaPath(Episode) },
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
    @Param("seasonId") seasonId: string,
    @Request() req: any
  ): Promise<ResponseDto<Episode[]>> {
    return await this.seriesService.getEpisodes(seasonId, req.user.userType);
  }

  // Auto-ingestion
  @Post(":seriesId/auto-ingest")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("series")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Start auto-ingestion for a series" })
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
    @Param("seriesId") seriesId: string,
    @Body() body: { folder_path: string },
    @Request() req: any
  ): Promise<ResponseDto<any>> {
    return await this.seriesService.autoIngestEpisodes(
      seriesId,
      body.folder_path,
      req.user.userType
    );
  }
}
