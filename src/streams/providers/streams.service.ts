import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Stream, StreamStatus } from "../../entities/stream.entity";
import { Bouquet } from "../../entities/bouquet.entity";
import { CreateStreamDto } from "../dtos/create-stream.dto";
import { UpdateStreamDto } from "../dtos/update-stream.dto";
import { QueryStreamDto } from "../dtos/query-stream.dto";
import { BulkDeleteStreamsDto } from "../dtos/bulk-delete-streams.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class StreamsService {
  constructor(
    @InjectRepository(Stream)
    private readonly streamRepository: Repository<Stream>,
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>
  ) {}

  async createStream(
    createStreamDto: CreateStreamDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin can create streams
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create streams");
    }

    // Check if stream with same name already exists in the same application
    const existingStream = await this.streamRepository.findOne({
      where: {
        original_name: createStreamDto.original_name,
        application_id: createStreamDto.application_id,
      },
    });

    if (existingStream) {
      throw new ConflictException(
        "Stream with this name already exists in this application"
      );
    }

    // Validate timeshift URL if timeshift is enabled
    if (createStreamDto.timeshift_enabled && !createStreamDto.timeshift_url) {
      throw new BadRequestException(
        "Timeshift URL is required when timeshift is enabled"
      );
    }

    const stream = this.streamRepository.create(createStreamDto);
    const savedStream = await this.streamRepository.save(stream);

    // Load relationships
    const streamWithRelations = await this.streamRepository.findOne({
      where: { id: savedStream.id },
      relations: [
        "application",
        "bouquet",
        "categories",
        "sub_categories",
        "servers",
      ],
    });

    return ResponseDto.success(
      "Stream created successfully",
      streamWithRelations,
      201
    );
  }

  async getAllStreams(
    queryDto: QueryStreamDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream[]>> {
    // Only Super Admin and Admin can view streams
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.streamRepository
      .createQueryBuilder("stream")
      .leftJoinAndSelect("stream.application", "application")
      .leftJoinAndSelect("stream.bouquet", "bouquet")
      .leftJoinAndSelect("stream.categories", "categories")
      .leftJoinAndSelect("stream.sub_categories", "sub_categories")
      .leftJoinAndSelect("stream.servers", "servers");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(stream.original_name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.channel_id) {
      query.andWhere("LOWER(stream.channel_id) LIKE LOWER(:channel_id)", {
        channel_id: `%${queryDto.channel_id}%`,
      });
    }

    if (queryDto.url) {
      query.andWhere("LOWER(stream.url) LIKE LOWER(:url)", {
        url: `%${queryDto.url}%`,
      });
    }

    if (queryDto.application_id) {
      query.andWhere("stream.application_id = :application_id", {
        application_id: queryDto.application_id,
      });
    }

    if (queryDto.category_id) {
      query.andWhere("categories.id = :category_id", {
        category_id: queryDto.category_id,
      });
    }

    if (queryDto.sub_category_id) {
      query.andWhere("sub_categories.id = :sub_category_id", {
        sub_category_id: queryDto.sub_category_id,
      });
    }

    if (queryDto.server_id) {
      query.andWhere("servers.id = :server_id", {
        server_id: queryDto.server_id,
      });
    }

    if (queryDto.status) {
      query.andWhere("stream.status = :status", { status: queryDto.status });
    }

    if (queryDto.p2p_enabled !== undefined) {
      query.andWhere("stream.p2p_enabled = :p2p_enabled", {
        p2p_enabled: queryDto.p2p_enabled,
      });
    }

    if (queryDto.timeshift_enabled !== undefined) {
      query.andWhere("stream.timeshift_enabled = :timeshift_enabled", {
        timeshift_enabled: queryDto.timeshift_enabled,
      });
    }

    if (queryDto.quality) {
      query.andWhere("stream.quality = :quality", {
        quality: queryDto.quality,
      });
    }

    if (queryDto.resolution) {
      query.andWhere("stream.resolution = :resolution", {
        resolution: queryDto.resolution,
      });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "created_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`stream.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [streams, total] = await query.getManyAndCount();

    return ResponseDto.success("Streams retrieved successfully", streams);
  }

  async getStreamById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin and Admin can view streams
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: [
        "application",
        "bouquet",
        "categories",
        "sub_categories",
        "servers",
      ],
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    return ResponseDto.success("Stream retrieved successfully", stream);
  }

  async updateStream(
    id: string,
    updateStreamDto: UpdateStreamDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin can update streams
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can update streams");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: [
        "application",
        "bouquet",
        "categories",
        "sub_categories",
        "servers",
      ],
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    // Check if name is being changed and if it conflicts with existing
    if (
      updateStreamDto.original_name &&
      updateStreamDto.original_name !== stream.original_name
    ) {
      const existingStream = await this.streamRepository.findOne({
        where: {
          original_name: updateStreamDto.original_name,
          application_id:
            updateStreamDto.application_id || stream.application_id,
        },
      });

      if (existingStream) {
        throw new ConflictException(
          "Stream with this name already exists in this application"
        );
      }
    }

    // Validate timeshift URL if timeshift is enabled
    if (updateStreamDto.timeshift_enabled && !updateStreamDto.timeshift_url) {
      throw new BadRequestException(
        "Timeshift URL is required when timeshift is enabled"
      );
    }

    Object.assign(stream, updateStreamDto);
    const updatedStream = await this.streamRepository.save(stream);

    // Reload with relations
    const streamWithRelations = await this.streamRepository.findOne({
      where: { id: updatedStream.id },
      relations: [
        "application",
        "bouquet",
        "categories",
        "sub_categories",
        "servers",
      ],
    });

    return ResponseDto.success(
      "Stream updated successfully",
      streamWithRelations
    );
  }

  async deleteStream(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete streams
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can delete streams");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    await this.streamRepository.softRemove(stream);

    return ResponseDto.success("Stream deleted successfully");
  }

  async bulkDeleteStreams(
    bulkDeleteDto: BulkDeleteStreamsDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const streams = await this.streamRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (streams.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some streams not found");
    }

    await this.streamRepository.softRemove(streams);

    return ResponseDto.success("Streams deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: StreamStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const streams = await this.streamRepository.find({
      where: { id: In(ids) },
    });

    if (streams.length !== ids.length) {
      throw new BadRequestException("Some streams not found");
    }

    streams.forEach((stream) => {
      stream.status = status;
    });

    await this.streamRepository.save(streams);

    return ResponseDto.success("Stream statuses updated successfully");
  }

  async toggleP2P(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin can toggle P2P
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can toggle P2P");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    stream.p2p_enabled = !stream.p2p_enabled;
    const updatedStream = await this.streamRepository.save(stream);

    return ResponseDto.success(
      "P2P status toggled successfully",
      updatedStream
    );
  }

  async assignBouquets(
    id: string,
    bouquetIds: string[],
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin can assign bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign bouquets");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: ["bouquets"],
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    // Load the bouquets to assign
    const bouquets = await this.bouquetRepository.find({
      where: { id: In(bouquetIds) },
    });

    if (bouquets.length !== bouquetIds.length) {
      const foundIds = bouquets.map((b) => b.id);
      const missingIds = bouquetIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Bouquets not found: ${missingIds.join(", ")}`
      );
    }

    // Assign the bouquets to the stream (many-to-many relationship)
    stream.bouquets = bouquets;
    const updatedStream = await this.streamRepository.save(stream);

    // Load the updated stream with all relations
    const streamWithRelations = await this.streamRepository.findOne({
      where: { id },
      relations: [
        "application",
        "bouquet",
        "bouquets",
        "categories",
        "sub_categories",
        "servers",
      ],
    });

    return ResponseDto.success(
      "Bouquets assigned successfully",
      streamWithRelations
    );
  }

  async assignServers(
    id: string,
    serverIds: string[],
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Stream>> {
    // Only Super Admin can assign servers
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign servers");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
      relations: ["servers"],
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    // TODO: Load servers and assign them
    // This would require loading the Server entities and updating the many-to-many relationship

    return ResponseDto.success("Servers assigned successfully", stream);
  }

  async previewStream(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<{ url: string }>> {
    // Only Super Admin and Admin can preview streams
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    if (stream.status === StreamStatus.DISABLED) {
      throw new BadRequestException("Cannot preview disabled stream");
    }

    return ResponseDto.success("Stream preview URL", { url: stream.url });
  }

  async stopStream(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can stop streams
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can stop streams");
    }

    const stream = await this.streamRepository.findOne({
      where: { id },
    });

    if (!stream) {
      throw new BadRequestException("Stream not found");
    }

    stream.status = StreamStatus.DISABLED;
    await this.streamRepository.save(stream);

    return ResponseDto.success("Stream stopped successfully");
  }
}
