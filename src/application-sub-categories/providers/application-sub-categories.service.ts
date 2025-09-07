import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApplicationSubCategory } from "../../entities/application-sub-category.entity";
import { Application } from "../../entities/application.entity";
import { SubCategory } from "../../entities/sub-category.entity";
import { CreateApplicationSubCategoryDto } from "../dtos/create-application-sub-category.dto";
import { UpdateApplicationSubCategoryDto } from "../dtos/update-application-sub-category.dto";
import { QueryApplicationSubCategoryDto } from "../dtos/query-application-sub-category.dto";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class ApplicationSubCategoriesService {
  constructor(
    @InjectRepository(ApplicationSubCategory)
    private applicationSubCategoriesRepository: Repository<ApplicationSubCategory>,
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    @InjectRepository(SubCategory)
    private subCategoriesRepository: Repository<SubCategory>
  ) {}

  /**
   * Create a new application-sub-category relationship
   * @param createApplicationSubCategoryDto
   * @returns
   */
  async create(
    createApplicationSubCategoryDto: CreateApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory>> {
    const { application_id, sub_category_id } = createApplicationSubCategoryDto;

    // Check if application exists
    const application = await this.applicationsRepository.findOne({
      where: { id: application_id },
    });
    if (!application) {
      throw new BadRequestException(
        `Application with ID ${application_id} not found`
      );
    }

    // Check if sub-category exists
    const subCategory = await this.subCategoriesRepository.findOne({
      where: { id: sub_category_id },
    });
    if (!subCategory) {
      throw new BadRequestException(
        `Sub-category with ID ${sub_category_id} not found`
      );
    }

    // Check if relationship already exists
    const existingRelationship =
      await this.applicationSubCategoriesRepository.findOne({
        where: { application_id, sub_category_id },
      });
    if (existingRelationship) {
      throw new ConflictException(
        `Application-sub-category relationship already exists`
      );
    }

    const applicationSubCategory =
      this.applicationSubCategoriesRepository.create(
        createApplicationSubCategoryDto
      );
    const savedApplicationSubCategory =
      await this.applicationSubCategoriesRepository.save(
        applicationSubCategory
      );
    return ResponseDto.success(
      "Application-sub-category relationship created successfully",
      savedApplicationSubCategory,
      201
    );
  }

  /**
   * Find all application-sub-category relationships with optional filters
   * @param queryDto
   * @returns
   */
  async findAll(
    queryDto: QueryApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory[]>> {
    const {
      application_id,
      sub_category_id,
      alias,
      status,
      sortBy = "order",
      sortOrder = "ASC",
    } = queryDto;

    const queryBuilder =
      this.applicationSubCategoriesRepository.createQueryBuilder("asc");

    // Add filters
    if (application_id) {
      queryBuilder.andWhere("asc.application_id = :application_id", {
        application_id,
      });
    }

    if (sub_category_id) {
      queryBuilder.andWhere("asc.sub_category_id = :sub_category_id", {
        sub_category_id,
      });
    }

    if (alias) {
      queryBuilder.andWhere("asc.alias LIKE :alias", { alias: `%${alias}%` });
    }

    if (status !== undefined) {
      queryBuilder.andWhere("asc.status = :status", { status });
    }

    // Add sorting
    queryBuilder.orderBy(`asc.${sortBy}`, sortOrder);

    const relationships = await queryBuilder.getMany();

    return ResponseDto.success(
      "Application-sub-category relationships retrieved successfully",
      relationships
    );
  }

  /**
   * Find a specific application-sub-category relationship by ID
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<ResponseDto<ApplicationSubCategory>> {
    const relationship = await this.applicationSubCategoriesRepository.findOne({
      where: { id },
      relations: ["application", "sub_category"],
    });

    if (!relationship) {
      throw new BadRequestException(
        `Application-sub-category relationship with ID ${id} not found`
      );
    }

    return ResponseDto.success(
      "Application-sub-category relationship retrieved successfully",
      relationship
    );
  }

  /**
   * Update an application-sub-category relationship
   * @param id
   * @param updateDto
   * @returns
   */
  async update(
    id: string,
    updateDto: UpdateApplicationSubCategoryDto
  ): Promise<ResponseDto<ApplicationSubCategory>> {
    const relationship = await this.applicationSubCategoriesRepository.findOne({
      where: { id },
    });

    if (!relationship) {
      throw new BadRequestException(
        `Application-sub-category relationship with ID ${id} not found`
      );
    }

    // Check for conflicts if application_id or sub_category_id is being updated
    if (updateDto.application_id || updateDto.sub_category_id) {
      const newApplicationId =
        updateDto.application_id || relationship.application_id;
      const newSubCategoryId =
        updateDto.sub_category_id || relationship.sub_category_id;

      const existingRelationship =
        await this.applicationSubCategoriesRepository.findOne({
          where: {
            application_id: newApplicationId,
            sub_category_id: newSubCategoryId,
          },
        });

      if (existingRelationship && existingRelationship.id !== id) {
        throw new ConflictException(
          `Application-sub-category relationship already exists`
        );
      }
    }

    Object.assign(relationship, updateDto);
    const updatedRelationship =
      await this.applicationSubCategoriesRepository.save(relationship);

    return ResponseDto.success(
      "Application-sub-category relationship updated successfully",
      updatedRelationship
    );
  }

  /**
   * Remove an application-sub-category relationship
   * @param id
   * @returns
   */
  async remove(id: string): Promise<ResponseDto<void>> {
    const relationship = await this.applicationSubCategoriesRepository.findOne({
      where: { id },
    });

    if (!relationship) {
      throw new BadRequestException(
        `Application-sub-category relationship with ID ${id} not found`
      );
    }

    await this.applicationSubCategoriesRepository.softDelete(id);

    return ResponseDto.success(
      "Application-sub-category relationship removed successfully"
    );
  }

  /**
   * Get sub-categories for a specific application
   * @param applicationId
   * @returns
   */
  async getSubCategoriesByApplication(applicationId: string): Promise<any[]> {
    const relationships = await this.applicationSubCategoriesRepository.find({
      where: { application_id: applicationId, status: true },
      relations: ["sub_category", "sub_category.category"],
      order: { order: "ASC" },
    });

    return relationships.map((relationship) => ({
      ...relationship,
      display_name:
        relationship.alias ||
        relationship.sub_category.show_name_on_application ||
        relationship.sub_category.original_name,
    }));
  }

  /**
   * Get applications for a specific sub-category
   * @param subCategoryId
   * @returns
   */
  async getApplicationsBySubCategory(subCategoryId: string): Promise<any[]> {
    const relationships = await this.applicationSubCategoriesRepository.find({
      where: { sub_category_id: subCategoryId, status: true },
      relations: ["application"],
      order: { order: "ASC" },
    });

    return relationships.map((relationship) => ({
      ...relationship,
      display_name: relationship.alias || relationship.application.name,
    }));
  }
}
