import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import {
  Radio,
  RadioStatus,
  RadioSourceType,
} from "../../entities/radio.entity";
import { Bouquet } from "../../entities/bouquet.entity";
import { CreateRadioDto } from "../dtos/create-radio.dto";
import { UpdateRadioDto } from "../dtos/update-radio.dto";
import { QueryRadioDto } from "../dtos/query-radio.dto";
import { BulkDeleteRadiosDto } from "../dtos/bulk-delete-radios.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class RadiosService {
  constructor(
    @InjectRepository(Radio)
    private readonly radioRepository: Repository<Radio>,
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>
  ) {}

  async createRadio(
    createRadioDto: CreateRadioDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio>> {
    // Only Super Admin can create radio stations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can create radio stations"
      );
    }

    // Validate source requirements
    if (
      createRadioDto.source_type === RadioSourceType.URL &&
      !createRadioDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      createRadioDto.source_type === RadioSourceType.STORAGE &&
      (!createRadioDto.server_id || !createRadioDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    const radio = this.radioRepository.create(createRadioDto);
    const savedRadio = await this.radioRepository.save(radio);

    // Load relationships
    const radioWithRelations = await this.radioRepository.findOne({
      where: { id: savedRadio.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    return ResponseDto.success(
      "Radio station created successfully",
      radioWithRelations,
      201
    );
  }

  async getAllRadios(
    queryDto: QueryRadioDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio[]>> {
    // Only Super Admin and Admin can view radio stations
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.radioRepository
      .createQueryBuilder("radio")
      .leftJoinAndSelect("radio.application", "application")
      .leftJoinAndSelect("radio.category", "category")
      .leftJoinAndSelect("radio.sub_category", "sub_category")
      .leftJoinAndSelect("radio.server", "server")
      .leftJoinAndSelect("radio.bouquets", "bouquets");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(radio.original_name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.category_id) {
      query.andWhere("radio.category_id = :category_id", {
        category_id: queryDto.category_id,
      });
    }

    if (queryDto.sub_category_id) {
      query.andWhere("radio.sub_category_id = :sub_category_id", {
        sub_category_id: queryDto.sub_category_id,
      });
    }

    if (queryDto.bouquet_id) {
      query.andWhere("bouquets.id = :bouquet_id", {
        bouquet_id: queryDto.bouquet_id,
      });
    }

    if (queryDto.status) {
      query.andWhere("radio.status = :status", { status: queryDto.status });
    }

    if (queryDto.language) {
      query.andWhere("LOWER(radio.language) LIKE LOWER(:language)", {
        language: `%${queryDto.language}%`,
      });
    }

    if (queryDto.country) {
      query.andWhere("LOWER(radio.country) LIKE LOWER(:country)", {
        country: `%${queryDto.country}%`,
      });
    }

    if (queryDto.source_type) {
      query.andWhere("radio.source_type = :source_type", {
        source_type: queryDto.source_type,
      });
    }

    if (queryDto.quality) {
      query.andWhere("radio.quality = :quality", { quality: queryDto.quality });
    }

    if (queryDto.added_date_from) {
      query.andWhere("radio.added_at >= :added_date_from", {
        added_date_from: queryDto.added_date_from,
      });
    }

    if (queryDto.added_date_to) {
      query.andWhere("radio.added_at <= :added_date_to", {
        added_date_to: queryDto.added_date_to,
      });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "added_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`radio.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [radios, total] = await query.getManyAndCount();

    return ResponseDto.success("Radio stations retrieved successfully", radios);
  }

  async getRadioById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio>> {
    // Only Super Admin and Admin can view radio stations
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const radio = await this.radioRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    if (!radio) {
      throw new BadRequestException("Radio station not found");
    }

    return ResponseDto.success("Radio station retrieved successfully", radio);
  }

  async updateRadio(
    id: string,
    updateRadioDto: UpdateRadioDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio>> {
    // Only Super Admin can update radio stations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can update radio stations"
      );
    }

    const radio = await this.radioRepository.findOne({
      where: { id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    if (!radio) {
      throw new BadRequestException("Radio station not found");
    }

    // Validate source requirements
    if (
      updateRadioDto.source_type === RadioSourceType.URL &&
      !updateRadioDto.source_url
    ) {
      throw new BadRequestException(
        "Source URL is required when source type is URL"
      );
    }

    if (
      updateRadioDto.source_type === RadioSourceType.STORAGE &&
      (!updateRadioDto.server_id || !updateRadioDto.storage_path)
    ) {
      throw new BadRequestException(
        "Server ID and storage path are required when source type is storage"
      );
    }

    Object.assign(radio, updateRadioDto);
    const updatedRadio = await this.radioRepository.save(radio);

    // Reload with relations
    const radioWithRelations = await this.radioRepository.findOne({
      where: { id: updatedRadio.id },
      relations: [
        "application",
        "category",
        "sub_category",
        "server",
        "bouquets",
      ],
    });

    return ResponseDto.success(
      "Radio station updated successfully",
      radioWithRelations
    );
  }

  async deleteRadio(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete radio stations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can delete radio stations"
      );
    }

    const radio = await this.radioRepository.findOne({
      where: { id },
    });

    if (!radio) {
      throw new BadRequestException("Radio station not found");
    }

    await this.radioRepository.softRemove(radio);

    return ResponseDto.success("Radio station deleted successfully");
  }

  async bulkDeleteRadios(
    bulkDeleteDto: BulkDeleteRadiosDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const radios = await this.radioRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (radios.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some radio stations not found");
    }

    await this.radioRepository.softRemove(radios);

    return ResponseDto.success("Radio stations deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: RadioStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const radios = await this.radioRepository.find({
      where: { id: In(ids) },
    });

    if (radios.length !== ids.length) {
      throw new BadRequestException("Some radio stations not found");
    }

    radios.forEach((radio) => {
      radio.status = status;
    });

    await this.radioRepository.save(radios);

    return ResponseDto.success("Radio station statuses updated successfully");
  }

  async assignBouquets(
    id: string,
    bouquetIds: string[],
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio>> {
    // Only Super Admin can assign bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign bouquets");
    }

    const radio = await this.radioRepository.findOne({
      where: { id },
      relations: ["bouquets"],
    });

    if (!radio) {
      throw new BadRequestException("Radio station not found");
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

    // Assign the bouquets to the radio (many-to-many relationship)
    radio.bouquets = bouquets;
    const updatedRadio = await this.radioRepository.save(radio);

    // Load the updated radio with all relations
    const radioWithRelations = await this.radioRepository.findOne({
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
      radioWithRelations
    );
  }

  async assignCategories(
    id: string,
    categoryId: string,
    subCategoryId: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Radio>> {
    // Only Super Admin can assign categories
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can assign categories");
    }

    const radio = await this.radioRepository.findOne({
      where: { id },
    });

    if (!radio) {
      throw new BadRequestException("Radio station not found");
    }

    radio.category_id = categoryId;
    radio.sub_category_id = subCategoryId;

    const updatedRadio = await this.radioRepository.save(radio);

    return ResponseDto.success(
      "Categories assigned successfully",
      updatedRadio
    );
  }

  // Auto-ingestion functionality (placeholder for folder watch)
  async autoIngestRadios(
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
    // 2. Parsing filenames to extract radio station information
    // 3. Creating radio stations automatically
    // 4. Updating the database

    return ResponseDto.success("Auto-ingestion started successfully");
  }
}
