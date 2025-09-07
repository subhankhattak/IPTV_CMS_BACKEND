import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import {
  Movie,
  MovieStatus,
  MovieSourceType,
} from "../../entities/movie.entity";
import { Bouquet } from "../../entities/bouquet.entity";
import { CreateMovieDto } from "../dtos/create-movie.dto";
import { UpdateMovieDto } from "../dtos/update-movie.dto";
import { QueryMovieDto } from "../dtos/query-movie.dto";
import { BulkDeleteMoviesDto } from "../dtos/bulk-delete-movies.dto";
import { FetchMetadataDto, MetadataSource } from "../dtos/fetch-metadata.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>
  ) {}

  async createMovie(
    createMovieDto: CreateMovieDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Movie>> {
    // Only Super Admin can create movies
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create movies");
    }

    // Validate source requirements
    if (
      createMovieDto.source_type === MovieSourceType.URL &&
      !createMovieDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createMovieDto.source_type === MovieSourceType.STORAGE &&
      (!createMovieDto.server_id || !createMovieDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (createMovieDto.imdb_id) {
      const existingImdb = await this.movieRepository.findOne({
        where: { imdb_id: createMovieDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Movie with this IMDB ID already exists");
      }
    }

    if (createMovieDto.tmdb_id) {
      const existingTmdb = await this.movieRepository.findOne({
        where: { tmdb_id: createMovieDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Movie with this TMDB ID already exists");
      }
    }

    const movie = this.movieRepository.create(createMovieDto);
    const savedMovie = await this.movieRepository.save(movie);

    // Load relationships
    const movieWithRelations = await this.movieRepository.findOne({
      where: { id: savedMovie.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    return ResponseDto.success(
      "Movie created successfully",
      movieWithRelations,
      201
    );
  }

  async getAllMovies(
    queryDto: QueryMovieDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Movie[]>> {
    // Only Super Admin and Admin can view movies
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.movieRepository
      .createQueryBuilder("movie")
      .leftJoinAndSelect("movie.application", "application")
      .leftJoinAndSelect("movie.category", "category")
      .leftJoinAndSelect("movie.sub_category", "sub_category")
      .leftJoinAndSelect("movie.server", "server")
      .leftJoinAndSelect("movie.bouquets", "bouquets");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(movie.original_name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.imdb_id) {
      query.andWhere("movie.imdb_id = :imdb_id", { imdb_id: queryDto.imdb_id });
    }

    if (queryDto.tmdb_id) {
      query.andWhere("movie.tmdb_id = :tmdb_id", { tmdb_id: queryDto.tmdb_id });
    }

    if (queryDto.category_id) {
      query.andWhere("movie.category_id = :category_id", {
        category_id: queryDto.category_id,
      });
    }

    if (queryDto.sub_category_id) {
      query.andWhere("movie.sub_category_id = :sub_category_id", {
        sub_category_id: queryDto.sub_category_id,
      });
    }

    if (queryDto.bouquet_id) {
      query.andWhere("bouquets.id = :bouquet_id", {
        bouquet_id: queryDto.bouquet_id,
      });
    }

    if (queryDto.status) {
      query.andWhere("movie.status = :status", { status: queryDto.status });
    }

    if (queryDto.language) {
      query.andWhere("LOWER(movie.language) LIKE LOWER(:language)", {
        language: `%${queryDto.language}%`,
      });
    }

    if (queryDto.source_type) {
      query.andWhere("movie.source_type = :source_type", {
        source_type: queryDto.source_type,
      });
    }

    if (queryDto.quality) {
      query.andWhere("movie.quality = :quality", { quality: queryDto.quality });
    }

    if (queryDto.resolution) {
      query.andWhere("movie.resolution = :resolution", {
        resolution: queryDto.resolution,
      });
    }

    if (queryDto.added_date_from) {
      query.andWhere("movie.added_at >= :added_date_from", {
        added_date_from: queryDto.added_date_from,
      });
    }

    if (queryDto.added_date_to) {
      query.andWhere("movie.added_at <= :added_date_to", {
        added_date_to: queryDto.added_date_to,
      });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "added_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`movie.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [movies, total] = await query.getManyAndCount();

    return ResponseDto.success("Movies retrieved successfully", movies);
  }

  async getMovieById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Movie>> {
    // Only Super Admin and Admin can view movies
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    if (!movie) {
      throw new BadRequestException("Movie not found");
    }

    return ResponseDto.success("Movie retrieved successfully", movie);
  }

  async updateMovie(
    id: string,
    updateMovieDto: UpdateMovieDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Movie>> {
    // Only Super Admin can update movies
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can update movies");
    }

    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    if (!movie) {
      throw new BadRequestException("Movie not found");
    }

    // Validate source requirements
    if (
      updateMovieDto.source_type === MovieSourceType.URL &&
      !updateMovieDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      updateMovieDto.source_type === MovieSourceType.STORAGE &&
      (!updateMovieDto.server_id || !updateMovieDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    // Check for duplicate IMDB/TMDB IDs
    if (updateMovieDto.imdb_id && updateMovieDto.imdb_id !== movie.imdb_id) {
      const existingImdb = await this.movieRepository.findOne({
        where: { imdb_id: updateMovieDto.imdb_id },
      });
      if (existingImdb) {
        throw new ConflictException("Movie with this IMDB ID already exists");
      }
    }

    if (updateMovieDto.tmdb_id && updateMovieDto.tmdb_id !== movie.tmdb_id) {
      const existingTmdb = await this.movieRepository.findOne({
        where: { tmdb_id: updateMovieDto.tmdb_id },
      });
      if (existingTmdb) {
        throw new ConflictException("Movie with this TMDB ID already exists");
      }
    }

    Object.assign(movie, updateMovieDto);
    const updatedMovie = await this.movieRepository.save(movie);

    // Reload with relations
    const movieWithRelations = await this.movieRepository.findOne({
      where: { id: updatedMovie.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    return ResponseDto.success(
      "Movie updated successfully",
      movieWithRelations
    );
  }

  async deleteMovie(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete movies
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can delete movies");
    }

    const movie = await this.movieRepository.findOne({
      where: { id },
    });

    if (!movie) {
      throw new BadRequestException("Movie not found");
    }

    await this.movieRepository.softRemove(movie);

    return ResponseDto.success("Movie deleted successfully");
  }

  async bulkDeleteMovies(
    bulkDeleteDto: BulkDeleteMoviesDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const movies = await this.movieRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (movies.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some movies not found");
    }

    await this.movieRepository.softRemove(movies);

    return ResponseDto.success("Movies deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: MovieStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const movies = await this.movieRepository.find({
      where: { id: In(ids) },
    });

    if (movies.length !== ids.length) {
      throw new BadRequestException("Some movies not found");
    }

    movies.forEach((movie) => {
      movie.status = status;
    });

    await this.movieRepository.save(movies);

    return ResponseDto.success("Movie statuses updated successfully");
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
          original_name: "Sample Movie",
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
          original_name: "Sample Movie",
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
  ): Promise<ResponseDto<Movie>> {
    // Only Super Admin can assign bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign bouquets");
    }

    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ["bouquets"],
    });

    if (!movie) {
      throw new BadRequestException("Movie not found");
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

    // Assign the bouquets to the movie (many-to-many relationship)
    movie.bouquets = bouquets;
    const updatedMovie = await this.movieRepository.save(movie);

    // Load the updated movie with all relations
    const movieWithRelations = await this.movieRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    return ResponseDto.success(
      "Bouquets assigned successfully",
      movieWithRelations
    );
  }

  async assignCategories(
    id: string,
    categoryId: string,
    subCategoryId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Movie>> {
    // Only Super Admin can assign categories
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign categories");
    }

    const movie = await this.movieRepository.findOne({
      where: { id },
    });

    if (!movie) {
      throw new BadRequestException("Movie not found");
    }

    movie.category_id = categoryId;
    movie.sub_category_id = subCategoryId;

    const updatedMovie = await this.movieRepository.save(movie);

    return ResponseDto.success(
      "Categories assigned successfully",
      updatedMovie
    );
  }
}
