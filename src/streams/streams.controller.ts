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
import { StreamsService } from "./providers/streams.service";
import { CreateStreamDto } from "./dtos/create-stream.dto";
import { UpdateStreamDto } from "./dtos/update-stream.dto";
import { QueryStreamDto } from "./dtos/query-stream.dto";
import { BulkDeleteStreamsDto } from "./dtos/bulk-delete-streams.dto";
import { Stream, StreamStatus } from "../entities/stream.entity";
import { ResponseDto } from "../common/dtos/response.dto";

import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { UserTypeEnum } from "../users/enums/userType.enum";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";

@ApiTags("Streams")
@ApiBearerAuth()
@Controller("streams")
@UseGuards(RolesGuard)
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new stream (Super Admin only)" })
  @ApiResponse({
    status: 201,
    description: "Stream created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
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
    description: "Conflict - stream name already exists",
  })
  async create(
    @Body() createStreamDto: CreateStreamDto,
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.createStream(
      createStreamDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ApiOperation({ summary: "Get all streams with filtering and pagination" })
  @ApiResponse({
    status: 200,
    description: "Streams retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Stream) },
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
    @Query() queryDto: QueryStreamDto,
    @Request() req: any
  ): Promise<ResponseDto<Stream[]>> {
    return await this.streamsService.getAllStreams(queryDto, req.user.userType);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a specific stream by ID" })
  @ApiResponse({
    status: 200,
    description: "Stream retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Stream not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.getStreamById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
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
  @ApiResponse({ status: 400, description: "Stream not found" })
  @ApiResponse({
    status: 409,
    description: "Conflict - stream name already exists",
  })
  async update(
    @Param("id") id: string,
    @Body() updateStreamDto: UpdateStreamDto,
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.updateStream(
      id,
      updateStreamDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream deleted successfully",
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
  @ApiResponse({ status: 400, description: "Stream not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.streamsService.deleteStream(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete streams (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Streams deleted successfully",
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
  @ApiResponse({ status: 400, description: "Some streams not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteStreamsDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.streamsService.bulkDeleteStreams(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable streams (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream statuses updated successfully",
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
  @ApiResponse({ status: 400, description: "Some streams not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.streamsService.bulkUpdateStatus(
      body.ids,
      StreamStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable streams (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream statuses updated successfully",
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
  @ApiResponse({ status: 400, description: "Some streams not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.streamsService.bulkUpdateStatus(
      body.ids,
      StreamStatus.DISABLED,
      req.user.userType
    );
  }

  @Post(":id/toggle-p2p")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Toggle P2P for a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "P2P status toggled successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Stream not found" })
  async toggleP2P(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.toggleP2P(id, req.user.userType);
  }

  @Post(":id/assign-bouquets")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign bouquets to a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Bouquets assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
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
  @ApiResponse({ status: 400, description: "Stream not found" })
  async assignBouquets(
    @Param("id") id: string,
    @Body() body: { bouquet_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.assignBouquets(
      id,
      body.bouquet_ids,
      req.user.userType
    );
  }

  @Post(":id/assign-servers")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign servers to a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Servers assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Stream) },
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
  @ApiResponse({ status: 400, description: "Stream not found" })
  async assignServers(
    @Param("id") id: string,
    @Body() body: { server_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Stream>> {
    return await this.streamsService.assignServers(
      id,
      body.server_ids,
      req.user.userType
    );
  }

  @Post(":id/preview")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Preview a stream (Super Admin and Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream preview URL",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  example: "https://example.com/stream.m3u8",
                },
              },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Bad request - stream is disabled" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Stream not found" })
  async previewStream(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<{ url: string }>> {
    return await this.streamsService.previewStream(id, req.user.userType);
  }

  @Post(":id/stop")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("streams")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Stop a stream (Super Admin only)" })
  @ApiResponse({
    status: 200,
    description: "Stream stopped successfully",
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
  @ApiResponse({ status: 400, description: "Stream not found" })
  async stopStream(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.streamsService.stopStream(id, req.user.userType);
  }
}
