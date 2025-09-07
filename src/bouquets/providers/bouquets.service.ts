import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, In, Not } from "typeorm";
import { Bouquet, BouquetStatus } from "../../entities/bouquet.entity";
import {
  BouquetMergeLog,
  MergeAction,
} from "../../entities/bouquet-merge-log.entity";
import { CreateBouquetDto } from "../dtos/create-bouquet.dto";
import { UpdateBouquetDto } from "../dtos/update-bouquet.dto";
import { QueryBouquetDto } from "../dtos/query-bouquet.dto";
import { BulkDeleteBouquetsDto } from "../dtos/bulk-delete-bouquets.dto";
import { MergeBouquetsDto } from "../dtos/merge-bouquets.dto";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";

@Injectable()
export class BouquetsService {
  constructor(
    @InjectRepository(Bouquet)
    private readonly bouquetRepository: Repository<Bouquet>,
    @InjectRepository(BouquetMergeLog)
    private readonly mergeLogRepository: Repository<BouquetMergeLog>,
    private readonly dataSource: DataSource
  ) {}

  async createBouquet(
    createBouquetDto: CreateBouquetDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Bouquet>> {
    // Only Super Admin can create bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can create bouquets");
    }

    // Check if bouquet with same name already exists
    const existingBouquet = await this.bouquetRepository.findOne({
      where: { name: createBouquetDto.name },
    });

    if (existingBouquet) {
      throw new ConflictException("Bouquet with this name already exists");
    }

    const bouquet = this.bouquetRepository.create(createBouquetDto);
    const savedBouquet = await this.bouquetRepository.save(bouquet);

    return ResponseDto.success(
      "Bouquet created successfully",
      savedBouquet,
      201
    );
  }

  async getAllBouquets(
    queryDto: QueryBouquetDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Bouquet[]>> {
    // Admin can only view, Super Admin can view all
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const query = this.bouquetRepository.createQueryBuilder("bouquet");

    // Apply filters
    if (queryDto.name) {
      query.andWhere("LOWER(bouquet.name) LIKE LOWER(:name)", {
        name: `%${queryDto.name}%`,
      });
    }

    if (queryDto.region) {
      query.andWhere("bouquet.region = :region", { region: queryDto.region });
    }

    if (queryDto.status) {
      query.andWhere("bouquet.status = :status", { status: queryDto.status });
    }

    // Apply sorting
    const sortBy = queryDto.sortBy || "created_at";
    const sortOrder = queryDto.sortOrder || "DESC";
    query.orderBy(`bouquet.${sortBy}`, sortOrder as "ASC" | "DESC");

    // Apply pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [bouquets, total] = await query.getManyAndCount();

    return ResponseDto.success("Bouquets retrieved successfully", bouquets);
  }

  async getBouquetById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Bouquet>> {
    // Admin can only view, Super Admin can view all
    if (
      currentUserType !== UserTypeEnum.SUPER_ADMIN &&
      currentUserType !== UserTypeEnum.ADMIN
    ) {
      throw new BadRequestException("Access denied");
    }

    const bouquet = await this.bouquetRepository.findOne({
      where: { id },
    });

    if (!bouquet) {
      throw new BadRequestException("Bouquet not found");
    }

    return ResponseDto.success("Bouquet retrieved successfully", bouquet);
  }

  async updateBouquet(
    id: string,
    updateBouquetDto: UpdateBouquetDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<Bouquet>> {
    // Only Super Admin can update bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can update bouquets");
    }

    const bouquet = await this.bouquetRepository.findOne({
      where: { id },
    });

    if (!bouquet) {
      throw new BadRequestException("Bouquet not found");
    }

    // Check if name is being changed and if it conflicts with existing
    if (updateBouquetDto.name && updateBouquetDto.name !== bouquet.name) {
      const existingBouquet = await this.bouquetRepository.findOne({
        where: { name: updateBouquetDto.name },
      });

      if (existingBouquet) {
        throw new ConflictException("Bouquet with this name already exists");
      }
    }

    Object.assign(bouquet, updateBouquetDto);
    const updatedBouquet = await this.bouquetRepository.save(bouquet);

    return ResponseDto.success("Bouquet updated successfully", updatedBouquet);
  }

  async deleteBouquet(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can delete bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can delete bouquets");
    }

    const bouquet = await this.bouquetRepository.findOne({
      where: { id },
    });

    if (!bouquet) {
      throw new BadRequestException("Bouquet not found");
    }

    // Check for active content associations before deletion
    const hasActiveContent = await this.checkActiveContentAssociations(id);
    if (hasActiveContent) {
      throw new BadRequestException(
        "Cannot delete bouquet with active content associations. Please remove all assigned content first."
      );
    }

    await this.bouquetRepository.softRemove(bouquet);

    return ResponseDto.success("Bouquet deleted successfully");
  }

  async bulkDeleteBouquets(
    bulkDeleteDto: BulkDeleteBouquetsDto,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const bouquets = await this.bouquetRepository.find({
      where: { id: In(bulkDeleteDto.ids) },
    });

    if (bouquets.length !== bulkDeleteDto.ids.length) {
      throw new BadRequestException("Some bouquets not found");
    }

    // Check for active content associations before deletion
    for (const bouquet of bouquets) {
      const hasActiveContent = await this.checkActiveContentAssociations(
        bouquet.id
      );
      if (hasActiveContent) {
        throw new BadRequestException(
          `Cannot delete bouquet "${bouquet.name}" with active content associations. Please remove all assigned content first.`
        );
      }
    }

    await this.bouquetRepository.softRemove(bouquets);

    return ResponseDto.success("Bouquets deleted successfully");
  }

  async bulkUpdateStatus(
    ids: string[],
    status: BouquetStatus,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    // Only Super Admin can perform bulk operations
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException(
        "Only Super Admin can perform bulk operations"
      );
    }

    const bouquets = await this.bouquetRepository.find({
      where: { id: In(ids) },
    });

    if (bouquets.length !== ids.length) {
      throw new BadRequestException("Some bouquets not found");
    }

    bouquets.forEach((bouquet) => {
      bouquet.status = status;
    });

    await this.bouquetRepository.save(bouquets);

    return ResponseDto.success("Bouquet statuses updated successfully");
  }

  async mergeBouquets(
    mergeDto: MergeBouquetsDto,
    currentUserType: UserTypeEnum,
    actorId: string
  ): Promise<ResponseDto<Bouquet>> {
    // Only Super Admin can merge bouquets
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can merge bouquets");
    }

    // Validate minimum source count
    if (mergeDto.source_ids.length < 2) {
      throw new BadRequestException(
        "At least 2 source bouquets are required for merge"
      );
    }

    // Get source bouquets
    const sourceBouquets = await this.bouquetRepository.find({
      where: { id: In(mergeDto.source_ids) },
    });

    if (sourceBouquets.length !== mergeDto.source_ids.length) {
      throw new BadRequestException("Some source bouquets not found");
    }

    let targetBouquet: Bouquet;

    // Use query runner for transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (mergeDto.target_id) {
        // Use existing target
        targetBouquet = await queryRunner.manager.findOne(Bouquet, {
          where: { id: mergeDto.target_id },
        });

        if (!targetBouquet) {
          throw new BadRequestException("Target bouquet not found");
        }

        // Ensure target is not in source list
        if (mergeDto.source_ids.includes(mergeDto.target_id)) {
          throw new BadRequestException(
            "Target bouquet cannot be included in source list"
          );
        }
      } else if (mergeDto.new_target) {
        // Create new target
        const existingBouquet = await queryRunner.manager.findOne(Bouquet, {
          where: { name: mergeDto.new_target.name },
        });

        if (existingBouquet) {
          throw new ConflictException("Bouquet with this name already exists");
        }

        targetBouquet = queryRunner.manager.create(
          Bouquet,
          mergeDto.new_target
        );
        targetBouquet = await queryRunner.manager.save(Bouquet, targetBouquet);
      } else {
        throw new BadRequestException(
          "Either target_id or new_target must be provided"
        );
      }

      // TODO: Transfer all content associations from sources to target
      // This would involve updating all related tables (streams, movies, series, etc.)
      // For now, we'll just log the merge operation

      // Create merge log
      const mergeLog = queryRunner.manager.create(BouquetMergeLog, {
        source_ids: mergeDto.source_ids,
        target_id: targetBouquet.id,
        actor_id: actorId,
        action: mergeDto.action,
      });

      await queryRunner.manager.save(BouquetMergeLog, mergeLog);

      // Handle source bouquets based on action
      if (mergeDto.action === MergeAction.DISABLE) {
        sourceBouquets.forEach((bouquet) => {
          bouquet.status = BouquetStatus.DISABLED;
        });
        await queryRunner.manager.save(Bouquet, sourceBouquets);
      } else if (mergeDto.action === MergeAction.DELETE) {
        await queryRunner.manager.softRemove(Bouquet, sourceBouquets);
      }

      await queryRunner.commitTransaction();

      return ResponseDto.success("Bouquets merged successfully", targetBouquet);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMergeLogs(
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<BouquetMergeLog[]>> {
    // Only Super Admin can view merge logs
    if (currentUserType !== UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Only Super Admin can view merge logs");
    }

    const mergeLogs = await this.mergeLogRepository.find({
      relations: ["target_bouquet", "actor"],
      order: { created_at: "DESC" },
    });

    return ResponseDto.success("Merge logs retrieved successfully", mergeLogs);
  }

  /**
   * Check if a bouquet has active content associations
   * @param bouquetId
   * @returns boolean indicating if there are active associations
   */
  private async checkActiveContentAssociations(
    bouquetId: string
  ): Promise<boolean> {
    // Check in many-to-many relationship tables for bouquet associations
    // This would check stream_bouquets, movie_bouquets, series_bouquets, drama_bouquets, radio_bouquets tables

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM stream_bouquets WHERE bouquet_id = $1) +
        (SELECT COUNT(*) FROM movie_bouquets WHERE bouquet_id = $1) +
        (SELECT COUNT(*) FROM series_bouquets WHERE bouquet_id = $1) +
        (SELECT COUNT(*) FROM drama_bouquets WHERE bouquet_id = $1) +
        (SELECT COUNT(*) FROM radio_bouquets WHERE bouquet_id = $1) AS total_associations
    `;

    try {
      const result = await this.dataSource.query(query, [bouquetId]);
      const totalAssociations = parseInt(result[0]?.total_associations || "0");
      return totalAssociations > 0;
    } catch (error) {
      // If tables don't exist yet or query fails, assume no associations
      console.warn(`Could not check bouquet associations: ${error.message}`);
      return false;
    }
  }
}
