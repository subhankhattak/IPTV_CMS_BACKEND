import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import {
  Drama,
  DramaStatus,
  DramaSourceType,
} from "../../entities/drama.entity";
import {
  DramaEpisode,
  DramaEpisodeStatus,
  DramaEpisodeSourceType,
} from "../../entities/drama-episode.entity";
import { Bouquet } from "../../entities/bouquet.entity";
import { CreateDramaDto } from "../dtos/create-drama.dto";
import { UpdateDramaDto } from "../dtos/update-drama.dto";
import { QueryDramaDto } from "../dtos/query-drama.dto";
import { BulkDeleteDramasDto } from "../dtos/bulk-delete-dramas.dto";
import { CreateDramaEpisodeDto } from "../dtos/create-drama-episode.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class DramasService {
  constructor(
    @InjectRepository(Drama)
    private readonly dramaRepository: Repository<Drama>,
    @InjectRepository(DramaEpisode)
    private readonly dramaEpisodeRepository: Repository<DramaEpisode>,
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>
  ) {}

  async createDrama(
    createDramaDto: CreateDramaDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama>> {
    // Only Super Admin can create dramas
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create dramas");
    }

    // Validate source requirements
    if (
      createDramaDto.source_type === DramaSourceType.URL &&
      !createDramaDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createDramaDto.source_type === DramaSourceType.STORAGE &&
      (!createDramaDto.server_id || !createDramaDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (createDramaDto.imdb_id) {
      const existingImdb = await this.dramaRepository.findOne({
        where: { imdb_id: createDramaDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Drama with this IMDB ID already exists");
      }
    }

    if (createDramaDto.tmdb_id) {
      const existingTmdb = await this.dramaRepository.findOne({
        where: { tmdb_id: createDramaDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Drama with this TMDB ID already exists");
      }
    }

    const drama = this.dramaRepository.create(createDramaDto);
    const savedDrama = await this.dramaRepository.save(drama);

    // Load relationships
    const dramaWithRelations = await this.dramaRepository.findOne({
      where: { id: savedDrama.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "episodes",
      ],
    });

    return ResponseDto.success(
      "Drama created successfully",
      dramaWithRelations,
      201
    );
  }

  async getAllDramas(
    queryDto: QueryDramaDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama[]>> {
    // Only Super Admin and Admin can view dramas
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.dramaRepository
      .createQueryBuilder("drama")
      .leftJoinAndSelect("drama.application", "application")
      .leftJoinAndSelect("drama.category", "category")
      .leftJoinAndSelect("drama.sub_category", "sub_category")
      .leftJoinAndSelect("drama.server", "server")
      .leftJoinAndSelect("drama.bouquets", "bouquets")
      .leftJoinAndSelect("drama.episodes", "episodes");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(drama.original_name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.imdb_id) {
      query.andWhere("drama.imdb_id = :imdb_id", {
        imdb_id: queryDto.imdb_id,
      });
    }

    if (queryDto.tmdb_id) {
      query.andWhere("drama.tmdb_id = :tmdb_id", {
        tmdb_id: queryDto.tmdb_id,
      });
    }

    if (queryDto.category_id) {
      query.andWhere("drama.category_id = :category_id", {
        category_id: queryDto.category_id,
      });
    }

    if (queryDto.sub_category_id) {
      query.andWhere("drama.sub_category_id = :sub_category_id", {
        sub_category_id: queryDto.sub_category_id,
      });
    }

    if (queryDto.bouquet_id) {
      query.andWhere("bouquets.id = :bouquet_id", {
        bouquet_id: queryDto.bouquet_id,
      });
    }

    if (queryDto.status) {
      query.andWhere("drama.status = :status", { status: queryDto.status });
    }

    if (queryDto.language) {
      query.andWhere("LOWER(drama.language) LIKE LOWER(:language)", {
        language: `%${queryDto.language}%`,
      });
    }

    if (queryDto.source_type) {
      query.andWhere("drama.source_type = :source_type", {
        source_type: queryDto.source_type,
      });
    }

    if (queryDto.quality) {
      query.andWhere("drama.quality = :quality", { quality: queryDto.quality });
    }

    if (queryDto.resolution) {
      query.andWhere("drama.resolution = :resolution", {
        resolution: queryDto.resolution,
      });
    }

    if (queryDto.added_date_from) {
      query.andWhere("drama.added_at >= :added_date_from", {
        added_date_from: queryDto.added_date_from,
      });
    }

    if (queryDto.added_date_to) {
      query.andWhere("drama.added_at <= :added_date_to", {
        added_date_to: queryDto.added_date_to,
      });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "added_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`drama.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [dramas, total] = await query.getManyAndCount();

    return ResponseDto.success("Dramas retrieved successfully", dramas);
  }

  async getDramaById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama>> {
    // Only Super Admin and Admin can view dramas
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "episodes",
      ],
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
    }

    return ResponseDto.success("Drama retrieved successfully", drama);
  }

  async updateDrama(
    id: string,
    updateDramaDto: UpdateDramaDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama>> {
    // Only Super Admin can update dramas
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can update dramas");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "episodes",
      ],
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
    }

    // Validate source requirements
    if (
      updateDramaDto.source_type === DramaSourceType.URL &&
      !updateDramaDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      updateDramaDto.source_type === DramaSourceType.STORAGE &&
      (!updateDramaDto.server_id || !updateDramaDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (updateDramaDto.imdb_id && updateDramaDto.imdb_id !== drama.imdb_id) {
      const existingImdb = await this.dramaRepository.findOne({
        where: { imdb_id: updateDramaDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Drama with this IMDB ID already exists");
      }
    }

    if (updateDramaDto.tmdb_id && updateDramaDto.tmdb_id !== drama.tmdb_id) {
      const existingTmdb = await this.dramaRepository.findOne({
        where: { tmdb_id: updateDramaDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Drama with this TMDB ID already exists");
      }
    }

    Object.assign(drama, updateDramaDto);
    const updatedDrama = await this.dramaRepository.save(drama);

    // Reload with relations
    const dramaWithRelations = await this.dramaRepository.findOne({
      where: { id: updatedDrama.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "episodes",
      ],
    });

    return ResponseDto.success(
      "Drama updated successfully",
      dramaWithRelations
    );
  }

  async deleteDrama(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete dramas
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can delete dramas");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id },
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
    }

    await this.dramaRepository.softRemove(drama);

    return ResponseDto.success("Drama deleted successfully");
  }

  async bulkDeleteDramas(
    bulkDeleteDto: BulkDeleteDramasDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const dramas = await this.dramaRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (dramas.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some dramas not found");
    }

    await this.dramaRepository.softRemove(dramas);

    return ResponseDto.success("Dramas deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: DramaStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const dramas = await this.dramaRepository.find({
      where: { id: In(ids) },
    });

    if (dramas.length !== ids.length) {
      throw new BadRequestException("Some dramas not found");
    }

    dramas.forEach((drama) => {
      drama.status = status;
    });

    await this.dramaRepository.save(dramas);

    return ResponseDto.success("Drama statuses updated successfully");
  }

  async assignBouquets(
    id: string,
    bouquetIds: string[],
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama>> {
    // Only Super Admin can assign bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign bouquets");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id },
      relations: ["bouquets"],
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
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

    // Assign the bouquets to the drama (many-to-many relationship)
    drama.bouquets = bouquets;
    const updatedDrama = await this.dramaRepository.save(drama);

    // Load the updated drama with all relations
    const dramaWithRelations = await this.dramaRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "episodes",
      ],
    });

    return ResponseDto.success(
      "Bouquets assigned successfully",
      dramaWithRelations
    );
  }

  async assignCategories(
    id: string,
    categoryId: string,
    subCategoryId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Drama>> {
    // Only Super Admin can assign categories
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign categories");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id },
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
    }

    drama.category_id = categoryId;
    drama.sub_category_id = subCategoryId;

    const updatedDrama = await this.dramaRepository.save(drama);

    return ResponseDto.success(
      "Categories assigned successfully",
      updatedDrama
    );
  }

  // Episode Management
  async createEpisode(
    dramaId: string,
    createEpisodeDto: CreateDramaEpisodeDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<DramaEpisode>> {
    // Only Super Admin can create episodes
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create episodes");
    }

    const drama = await this.dramaRepository.findOne({
      where: { id: dramaId },
    });

    if (!drama) {
      throw new BadRequestException("Drama not found");
    }

    // Validate source requirements
    if (
      createEpisodeDto.source_type === DramaEpisodeSourceType.URL &&
      !createEpisodeDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createEpisodeDto.source_type === DramaEpisodeSourceType.STORAGE &&
      !createEpisodeDto.storage_path
    ) {
      throw new BadRequestException(
        "Storage path is required when source type is storage"
      );
    }

    // Check if episode number already exists
    const existingEpisode = await this.dramaEpisodeRepository.findOne({
      where: {
        drama_id: dramaId,
        episode_number: createEpisodeDto.episode_number,
      },
    });

    if (existingEpisode) {
      throw new ConflictException("Episode with this number already exists");
    }

    const episode = this.dramaEpisodeRepository.create({
      ...createEpisodeDto,
      drama_id: dramaId,
    });

    const savedEpisode = await this.dramaEpisodeRepository.save(episode);

    return ResponseDto.success(
      "Episode created successfully",
      savedEpisode,
      201
    );
  }

  async getEpisodes(
    dramaId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<DramaEpisode[]>> {
    // Only Super Admin and Admin can view episodes
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const episodes = await this.dramaEpisodeRepository.find({
      where: { drama_id: dramaId },
      order: { episode_number: "ASC" },
    });

    return ResponseDto.success("Episodes retrieved successfully", episodes);
  }

  // Auto-ingestion functionality (placeholder for folder watch)
  async autoIngestEpisodes(
    dramaId: string,
    folderPath: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<any>> {
    // Only Super Admin can trigger auto-ingestion
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can trigger auto-ingestion"
      );
    }

    // TODO: Implement folder watch and auto-ingestion logic
    // This would involve:
    // 1. Watching the specified folder for new files
    // 2. Parsing filenames to extract episode information
    // 3. Creating episodes automatically
    // 4. Updating the database

    return ResponseDto.success("Auto-ingestion started successfully");
  }
}
