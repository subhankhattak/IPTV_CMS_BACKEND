import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import {
  Series,
  SeriesStatus,
  SeriesSourceType,
} from "../../entities/series.entity";
import { Season, SeasonStatus } from "../../entities/season.entity";
import {
  Episode,
  EpisodeStatus,
  EpisodeSourceType,
} from "../../entities/episode.entity";
import { Bouquet } from "../../entities/bouquet.entity";
import { CreateSeriesDto } from "../dtos/create-series.dto";
import { UpdateSeriesDto } from "../dtos/update-series.dto";
import { QuerySeriesDto } from "../dtos/query-series.dto";
import { BulkDeleteSeriesDto } from "../dtos/bulk-delete-series.dto";
import { FetchMetadataDto, MetadataSource } from "../dtos/fetch-metadata.dto";
import { CreateSeasonDto } from "../dtos/create-season.dto";
import { CreateEpisodeDto } from "../dtos/create-episode.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>
  ) {}

  async createSeries(
    createSeriesDto: CreateSeriesDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series>> {
    // Only Super Admin can create series
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create series");
    }

    // Validate source requirements
    if (
      createSeriesDto.source_type === SeriesSourceType.URL &&
      !createSeriesDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createSeriesDto.source_type === SeriesSourceType.STORAGE &&
      (!createSeriesDto.server_id || !createSeriesDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (createSeriesDto.imdb_id) {
      const existingImdb = await this.seriesRepository.findOne({
        where: { imdb_id: createSeriesDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Series with this IMDB ID already exists");
      }
    }

    if (createSeriesDto.tmdb_id) {
      const existingTmdb = await this.seriesRepository.findOne({
        where: { tmdb_id: createSeriesDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Series with this TMDB ID already exists");
      }
    }

    const series = this.seriesRepository.create(createSeriesDto);
    const savedSeries = await this.seriesRepository.save(series);

    // Load relationships
    const seriesWithRelations = await this.seriesRepository.findOne({
      where: { id: savedSeries.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "seasons",
      ],
    });

    return ResponseDto.success(
      "Series created successfully",
      seriesWithRelations,
      201
    );
  }

  async getAllSeries(
    queryDto: QuerySeriesDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series[]>> {
    // Only Super Admin and Admin can view series
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.seriesRepository
      .createQueryBuilder("series")
      .leftJoinAndSelect("series.application", "application")
      .leftJoinAndSelect("series.category", "category")
      .leftJoinAndSelect("series.sub_category", "sub_category")
      .leftJoinAndSelect("series.server", "server")
      .leftJoinAndSelect("series.bouquets", "bouquets")
      .leftJoinAndSelect("series.seasons", "seasons");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(series.original_name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.imdb_id) {
      query.andWhere("series.imdb_id = :imdb_id", {
        imdb_id: queryDto.imdb_id,
      });
    }

    if (queryDto.tmdb_id) {
      query.andWhere("series.tmdb_id = :tmdb_id", {
        tmdb_id: queryDto.tmdb_id,
      });
    }

    if (queryDto.category_id) {
      query.andWhere("series.category_id = :category_id", {
        category_id: queryDto.category_id,
      });
    }

    if (queryDto.sub_category_id) {
      query.andWhere("series.sub_category_id = :sub_category_id", {
        sub_category_id: queryDto.sub_category_id,
      });
    }

    if (queryDto.bouquet_id) {
      query.andWhere("bouquets.id = :bouquet_id", {
        bouquet_id: queryDto.bouquet_id,
      });
    }

    if (queryDto.status) {
      query.andWhere("series.status = :status", { status: queryDto.status });
    }

    if (queryDto.language) {
      query.andWhere("LOWER(series.language) LIKE LOWER(:language)", {
        language: `%${queryDto.language}%`,
      });
    }

    if (queryDto.source_type) {
      query.andWhere("series.source_type = :source_type", {
        source_type: queryDto.source_type,
      });
    }

    if (queryDto.quality) {
      query.andWhere("series.quality = :quality", {
        quality: queryDto.quality,
      });
    }

    if (queryDto.resolution) {
      query.andWhere("series.resolution = :resolution", {
        resolution: queryDto.resolution,
      });
    }

    if (queryDto.added_date_from) {
      query.andWhere("series.added_at >= :added_date_from", {
        added_date_from: queryDto.added_date_from,
      });
    }

    if (queryDto.added_date_to) {
      query.andWhere("series.added_at <= :added_date_to", {
        added_date_to: queryDto.added_date_to,
      });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "added_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`series.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [series, total] = await query.getManyAndCount();

    return ResponseDto.success("Series retrieved successfully", series);
  }

  async getSeriesById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series>> {
    // Only Super Admin and Admin can view series
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "seasons",
        "seasons.episodes",
      ],
    });

    if (!series) {
      throw new BadRequestException("Series not found");
    }

    return ResponseDto.success("Series retrieved successfully", series);
  }

  async updateSeries(
    id: string,
    updateSeriesDto: UpdateSeriesDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series>> {
    // Only Super Admin can update series
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can update series");
    }

    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "seasons",
      ],
    });

    if (!series) {
      throw new BadRequestException("Series not found");
    }

    // Validate source requirements
    if (
      updateSeriesDto.source_type === SeriesSourceType.URL &&
      !updateSeriesDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      updateSeriesDto.source_type === SeriesSourceType.STORAGE &&
      (!updateSeriesDto.server_id || !updateSeriesDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (updateSeriesDto.imdb_id && updateSeriesDto.imdb_id !== series.imdb_id) {
      const existingImdb = await this.seriesRepository.findOne({
        where: { imdb_id: updateSeriesDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Series with this IMDB ID already exists");
      }
    }

    if (updateSeriesDto.tmdb_id && updateSeriesDto.tmdb_id !== series.tmdb_id) {
      const existingTmdb = await this.seriesRepository.findOne({
        where: { tmdb_id: updateSeriesDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Series with this TMDB ID already exists");
      }
    }

    Object.assign(series, updateSeriesDto);
    const updatedSeries = await this.seriesRepository.save(series);

    // Reload with relations
    const seriesWithRelations = await this.seriesRepository.findOne({
      where: { id: updatedSeries.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "seasons",
      ],
    });

    return ResponseDto.success(
      "Series updated successfully",
      seriesWithRelations
    );
  }

  async deleteSeries(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete series
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can delete series");
    }

    const series = await this.seriesRepository.findOne({
      where: { id },
    });

    if (!series) {
      throw new BadRequestException("Series not found");
    }

    await this.seriesRepository.softRemove(series);

    return ResponseDto.success("Series deleted successfully");
  }

  async bulkDeleteSeries(
    bulkDeleteDto: BulkDeleteSeriesDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const series = await this.seriesRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (series.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some series not found");
    }

    await this.seriesRepository.softRemove(series);

    return ResponseDto.success("Series deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: SeriesStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const series = await this.seriesRepository.find({
      where: { id: In(ids) },
    });

    if (series.length !== ids.length) {
      throw new BadRequestException("Some series not found");
    }

    series.forEach((series) => {
      series.status = status;
    });

    await this.seriesRepository.save(series);

    return ResponseDto.success("Series statuses updated successfully");
  }

  async fetchMetadata(
    fetchMetadataDto: FetchMetadataDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<any>> {
    // Only Super Admin can fetch metadata
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can fetch metadata");
    }

    try {
      let metadata: any = {};

      if (fetchMetadataDto.source === MetadataSource.IMDB) {
        // TODO: Implement IMDB API call
        metadata = {
          original_name: "Sample Series",
          description: "Sample description from IMDB",
          genres: "Action, Drama",
          cast: "Actor 1, Actor 2",
          director: "Director Name",
          release_date: "2024-01-01",
          language: "English",
        };
      } else if (fetchMetadataDto.source === MetadataSource.TMDB) {
        // TODO: Implement TMDB API call
        metadata = {
          original_name: "Sample Series",
          description: "Sample description from TMDB",
          genres: "Action, Drama",
          cast: "Actor 1, Actor 2",
          director: "Director Name",
          release_date: "2024-01-01",
          language: "English",
        };
      }

      return ResponseDto.success("Metadata fetched successfully", metadata);
    } catch (error) {
      throw new BadRequestException("Failed to fetch metadata");
    }
  }

  async assignBouquets(
    id: string,
    bouquetIds: string[],
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series>> {
    // Only Super Admin can assign bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign bouquets");
    }

    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ["bouquets"],
    });

    if (!series) {
      throw new BadRequestException("Series not found");
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

    // Assign the bouquets to the series (many-to-many relationship)
    series.bouquets = bouquets;
    const updatedSeries = await this.seriesRepository.save(series);

    // Load the updated series with all relations
    const seriesWithRelations = await this.seriesRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
        "seasons",
      ],
    });

    return ResponseDto.success(
      "Bouquets assigned successfully",
      seriesWithRelations
    );
  }

  async assignCategories(
    id: string,
    categoryId: string,
    subCategoryId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Series>> {
    // Only Super Admin can assign categories
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign categories");
    }

    const series = await this.seriesRepository.findOne({
      where: { id },
    });

    if (!series) {
      throw new BadRequestException("Series not found");
    }

    series.category_id = categoryId;
    series.sub_category_id = subCategoryId;

    const updatedSeries = await this.seriesRepository.save(series);

    return ResponseDto.success(
      "Categories assigned successfully",
      updatedSeries
    );
  }

  // Season Management
  async createSeason(
    seriesId: string,
    createSeasonDto: CreateSeasonDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Season>> {
    // Only Super Admin can create seasons
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create seasons");
    }

    const series = await this.seriesRepository.findOne({
      where: { id: seriesId },
    });

    if (!series) {
      throw new BadRequestException("Series not found");
    }

    // Check if season number already exists
    const existingSeason = await this.seasonRepository.findOne({
      where: {
        series_id: seriesId,
        season_number: createSeasonDto.season_number,
      },
    });

    if (existingSeason) {
      throw new ConflictException("Season with this number already exists");
    }

    const season = this.seasonRepository.create({
      ...createSeasonDto,
      series_id: seriesId,
    });

    const savedSeason = await this.seasonRepository.save(season);

    return ResponseDto.success("Season created successfully", savedSeason, 201);
  }

  async getSeasons(
    seriesId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Season[]>> {
    // Only Super Admin and Admin can view seasons
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const seasons = await this.seasonRepository.find({
      where: { series_id: seriesId },
      relations: ["episodes"],
      order: { season_number: "ASC" },
    });

    return ResponseDto.success("Seasons retrieved successfully", seasons);
  }

  // Episode Management
  async createEpisode(
    seasonId: string,
    createEpisodeDto: CreateEpisodeDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Episode>> {
    // Only Super Admin can create episodes
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create episodes");
    }

    const season = await this.seasonRepository.findOne({
      where: { id: seasonId },
    });

    if (!season) {
      throw new BadRequestException("Season not found");
    }

    // Validate source requirements
    if (
      createEpisodeDto.source_type === EpisodeSourceType.URL &&
      !createEpisodeDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createEpisodeDto.source_type === EpisodeSourceType.STORAGE &&
      !createEpisodeDto.storage_path
    ) {
      throw new BadRequestException(
        "Storage path is required when source type is storage"
      );
    }

    // Check if episode number already exists
    const existingEpisode = await this.episodeRepository.findOne({
      where: {
        season_id: seasonId,
        episode_number: createEpisodeDto.episode_number,
      },
    });

    if (existingEpisode) {
      throw new ConflictException("Episode with this number already exists");
    }

    const episode = this.episodeRepository.create({
      ...createEpisodeDto,
      season_id: seasonId,
    });

    const savedEpisode = await this.episodeRepository.save(episode);

    return ResponseDto.success(
      "Episode created successfully",
      savedEpisode,
      201
    );
  }

  async getEpisodes(
    seasonId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Episode[]>> {
    // Only Super Admin and Admin can view episodes
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const episodes = await this.episodeRepository.find({
      where: { season_id: seasonId },
      order: { episode_number: "ASC" },
    });

    return ResponseDto.success("Episodes retrieved successfully", episodes);
  }

  // Auto-ingestion functionality (placeholder for folder watch)
  async autoIngestEpisodes(
    seriesId: string,
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
    // 2. Parsing filenames to extract season/episode information
    // 3. Creating episodes automatically
    // 4. Updating the database

    return ResponseDto.success("Auto-ingestion started successfully");
  }
}
