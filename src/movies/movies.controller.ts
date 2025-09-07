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
import { MoviesService } from "./providers/movies.service";
import { CreateMovieDto } from "./dtos/create-movie.dto";
import { UpdateMovieDto } from "./dtos/update-movie.dto";
import { QueryMovieDto } from "./dtos/query-movie.dto";
import { BulkDeleteMoviesDto } from "./dtos/bulk-delete-movies.dto";
import { FetchMetadataDto } from "./dtos/fetch-metadata.dto";
import { Movie, MovieStatus } from "../entities/movie.entity";
import { ResponseDto } from "../common/dtos/response.dto";

import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";

@ApiTags("Movies")
@ApiBearerAuth()
@Controller("movies")
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("movies")
  @UseGuards(RolesGuard, AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new movie (Super Admin only)" })
  @ApiResponse({
    status: 201,
    description: "Movie created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Movie) },
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
    description: "Conflict - movie with this ID already exists",
  })
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @Request() req: any
  ): Promise<ResponseDto<Movie>> {
    return await this.moviesService.createMovie(
      createMovieDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Get all movies with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Movies retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Movie) },
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
    @Query() queryDto: QueryMovieDto,
    @Request() req: any
  ): Promise<ResponseDto<Movie[]>> {
    return await this.moviesService.getAllMovies(queryDto, req.user.userType);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a specific movie by ID" })
  @ApiResponse({
    status: 200,
    description: "Movie retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Movie) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Movie not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Movie>> {
    return await this.moviesService.getMovieById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a movie (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Movie updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Movie) },
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
  @ApiResponse({ status: 400, description: "Movie not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - movie with this ID already exists",
  })
  async update(
    @Param("id") id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @Request() req: any
  ): Promise<ResponseDto<Movie>> {
    return await this.moviesService.updateMovie(
      id,
      updateMovieDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a movie (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Movie deleted successfully",
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
  @ApiResponse({ status: 400, description: "Movie not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.moviesService.deleteMovie(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete movies (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Movies deleted successfully",
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
  @ApiResponse({ status: 400, description: "Some movies not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteMoviesDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.moviesService.bulkDeleteMovies(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable movies (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Movie statuses updated successfully",
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
  @ApiResponse({ status: 400, description: "Some movies not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.moviesService.bulkUpdateStatus(
      body.ids,
      MovieStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable movies (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Movie statuses updated successfully",
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
  @ApiResponse({ status: 400, description: "Some movies not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.moviesService.bulkUpdateStatus(
      body.ids,
      MovieStatus.DISABLED,
      req.user.userType
    );
  }

  @Post("fetch-metadata")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Fetch metadata from IMDB/TMDB (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Metadata fetched successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "object",
              properties: {
                original_name: { type: "string" },
                description: { type: "string" },
                genres: { type: "string" },
                cast: { type: "string" },
                director: { type: "string" },
                release_date: { type: "string" },
                language: { type: "string" },
              },
            },
          },
        },
      ],
    },
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
    return await this.moviesService.fetchMetadata(
      fetchMetadataDto,
      req.user.userType
    );
  }

  @Post(":id/assign-bouquets")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign bouquets to a movie (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquets assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Movie) },
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
  @ApiResponse({ status: 400, description: "Movie not found" })
  async assignBouquets(
    @Param("id") id: string,
    @Body() body: { bouquet_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Movie>> {
    return await this.moviesService.assignBouquets(
      id,
      body.bouquet_ids,
      req.user.userType
    );
  }

  @Post(":id/assign-categories")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("movies")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign categories to a movie (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Categories assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Movie) },
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
  @ApiResponse({ status: 400, description: "Movie not found" })
  async assignCategories(
    @Param("id") id: string,
    @Body() body: { category_id: string; sub_category_id: string },
    @Request() req: any
  ): Promise<ResponseDto<Movie>> {
    return await this.moviesService.assignCategories(
      id,
      body.category_id,
      body.sub_category_id,
      req.user.userType
    );
  }
}
