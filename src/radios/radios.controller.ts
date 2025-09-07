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
import { RadiosService } from "./providers/radios.service";
import { CreateRadioDto } from "./dtos/create-radio.dto";
import { UpdateRadioDto } from "./dtos/update-radio.dto";
import { QueryRadioDto } from "./dtos/query-radio.dto";
import { BulkDeleteRadiosDto } from "./dtos/bulk-delete-radios.dto";
import { ResponseDto } from "../common/dtos/response.dto";
import { Radio } from "../entities/radio.entity";
import { RadioStatus } from "../entities/radio.entity";
import { AuthenticationGuard } from "../auth/guards/authentication/authentication.guard";
import { RolesGuard } from "../auth/guards/roles/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { ModuleName } from "../auth/decorator/module-name.decorator";
import { AdminPermissionsGuard } from "../auth/guards/admin-permissions/admin-permissions.guard";
import { UserTypeEnum } from "../users/enums/userType.enum";

@ApiTags("Radio")
@ApiBearerAuth()
@Controller("radios")
@UseGuards(AuthenticationGuard, RolesGuard)
export class RadiosController {
  constructor(private readonly radiosService: RadiosService) {}

  @Post()
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Create a new radio station" })
  @ApiResponse({
    status: 201,
    description: "Radio station created successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Radio) },
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
  async create(
    @Body() createRadioDto: CreateRadioDto,
    @Request() req: any
  ): Promise<ResponseDto<Radio>> {
    return await this.radiosService.createRadio(
      createRadioDto,
      req.user.userType
    );
  }

  @Get()
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ApiOperation({
    summary: "Get all radio stations with filtering and pagination",
  })
  @ApiResponse({
    status: 200,
    description: "Radio stations retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: {
              type: "array",
              items: { $ref: getSchemaPath(Radio) },
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
    @Query() queryDto: QueryRadioDto,
    @Request() req: any
  ): Promise<ResponseDto<Radio[]>> {
    return await this.radiosService.getAllRadios(queryDto, req.user.userType);
  }

  @Get(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN, UserTypeEnum.ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Get a radio station by ID" })
  @ApiResponse({
    status: 200,
    description: "Radio station retrieved successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Radio) },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: "Radio station not found" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  async findOne(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<Radio>> {
    return await this.radiosService.getRadioById(id, req.user.userType);
  }

  @Patch(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Update a radio station" })
  @ApiResponse({
    status: 200,
    description: "Radio station updated successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Radio) },
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
  @ApiResponse({ status: 400, description: "Radio station not found" })
  async update(
    @Param("id") id: string,
    @Body() updateRadioDto: UpdateRadioDto,
    @Request() req: any
  ): Promise<ResponseDto<Radio>> {
    return await this.radiosService.updateRadio(
      id,
      updateRadioDto,
      req.user.userType
    );
  }

  @Delete(":id")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Delete a radio station" })
  @ApiResponse({
    status: 200,
    description: "Radio station deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Radio station not found" })
  async remove(
    @Param("id") id: string,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.radiosService.deleteRadio(id, req.user.userType);
  }

  @Post("bulk-delete")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk delete radio stations" })
  @ApiResponse({
    status: 200,
    description: "Radio stations deleted successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some radio stations not found" })
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeleteRadiosDto,
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.radiosService.bulkDeleteRadios(
      bulkDeleteDto,
      req.user.userType
    );
  }

  @Post("bulk-enable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk enable radio stations" })
  @ApiResponse({
    status: 200,
    description: "Radio station statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some radio stations not found" })
  async bulkEnable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.radiosService.bulkUpdateStatus(
      body.ids,
      RadioStatus.ENABLED,
      req.user.userType
    );
  }

  @Post("bulk-disable")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Bulk disable radio stations" })
  @ApiResponse({
    status: 200,
    description: "Radio station statuses updated successfully",
    schema: { $ref: getSchemaPath(ResponseDto) },
  })
  @ApiResponse({ status: 400, description: "Bad request - validation error" })
  @ApiResponse({
    status: 403,
    description: "Forbidden - insufficient permissions",
  })
  @ApiResponse({ status: 400, description: "Some radio stations not found" })
  async bulkDisable(
    @Body() body: { ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<void>> {
    return await this.radiosService.bulkUpdateStatus(
      body.ids,
      RadioStatus.DISABLED,
      req.user.userType
    );
  }

  @Post(":id/assign-bouquets")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign bouquets to a radio station" })
  @ApiResponse({
    status: 200,
    description: "Bouquets assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Radio) },
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
  @ApiResponse({ status: 400, description: "Radio station not found" })
  async assignBouquets(
    @Param("id") id: string,
    @Body() body: { bouquet_ids: string[] },
    @Request() req: any
  ): Promise<ResponseDto<Radio>> {
    return await this.radiosService.assignBouquets(
      id,
      body.bouquet_ids,
      req.user.userType
    );
  }

  @Post(":id/assign-categories")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Assign categories to a radio station" })
  @ApiResponse({
    status: 200,
    description: "Categories assigned successfully",
    schema: {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            data: { $ref: getSchemaPath(Radio) },
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
  @ApiResponse({ status: 400, description: "Radio station not found" })
  async assignCategories(
    @Param("id") id: string,
    @Body() body: { category_id: string; sub_category_id: string },
    @Request() req: any
  ): Promise<ResponseDto<Radio>> {
    return await this.radiosService.assignCategories(
      id,
      body.category_id,
      body.sub_category_id,
      req.user.userType
    );
  }

  // Auto-ingestion
  @Post("auto-ingest")
  @Roles(UserTypeEnum.SUPER_ADMIN)
  @ModuleName("radio")
  @UseGuards(AdminPermissionsGuard)
  @ApiOperation({ summary: "Start auto-ingestion for radio stations" })
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
    @Body() body: { folder_path: string },
    @Request() req: any
  ): Promise<ResponseDto<any>> {
    return await this.radiosService.autoIngestRadios(
      body.folder_path,
      req.user.userType
    );
  }
}
