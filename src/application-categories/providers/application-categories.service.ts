import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApplicationCategory } from "../../entities/application-category.entity";
import { Application } from "../../entities/application.entity";
import { Category } from "../../entities/category.entity";
import { CreateApplicationCategoryDto } from "../dtos/create-application-category.dto";
import { UpdateApplicationCategoryDto } from "../dtos/update-application-category.dto";
import { QueryApplicationCategoryDto } from "../dtos/query-application-category.dto";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class ApplicationCategoriesService {
  constructor(
    @InjectRepository(ApplicationCategory)
    private readonly applicationCategoriesRepository: Repository<ApplicationCategory>,
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>
  ) {}

  /**
   * Create a new application-category relationship
   * @param createApplicationCategoryDto
   * @returns
   */
  async create(
    createApplicationCategoryDto: CreateApplicationCategoryDto
  ): Promise<ResponseDto<ApplicationCategory>> {
    const { application_id, category_id } = createApplicationCategoryDto;

    // Check if application exists
    const application = await this.applicationsRepository.findOne({
      where: { id: application_id },
    });
    if (!application) {
      throw new BadRequestException(
        `Application with ID ${application_id} not found`
      );
    }

    // Check if category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: category_id },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${category_id} not found`
      );
    }

    // Check if relationship already exists
    const existingRelationship =
      await this.applicationCategoriesRepository.findOne({
        where: { application_id, category_id },
      });
    if (existingRelationship) {
      throw new ConflictException(
        `Application-category relationship already exists`
      );
    }

    const applicationCategory = this.applicationCategoriesRepository.create(
      createApplicationCategoryDto
    );
    const savedApplicationCategory =
      await this.applicationCategoriesRepository.save(applicationCategory);
    return ResponseDto.success(
      "Application-category relationship created successfully",
      savedApplicationCategory,
      201
    );
  }

  /**
   * Find all application-category relationships with optional filters
   * @param queryDto
   * @returns
   */
  async findAll(
    queryDto: QueryApplicationCategoryDto
  ): Promise<ResponseDto<any[]>> {
    const {
      application_id,
      category_id,
      alias,
      status,
      sortBy = "order",
      sortOrder = "ASC",
    } = queryDto;

    const queryBuilder = this.applicationCategoriesRepository
      .createQueryBuilder("applicationCategory")
      .leftJoinAndSelect("applicationCategory.application", "application")
      .leftJoinAndSelect("applicationCategory.category", "category");

    // Apply filters
    if (application_id) {
      queryBuilder.andWhere(
        "applicationCategory.application_id = :application_id",
        {
          application_id,
        }
      );
    }

    if (category_id) {
      queryBuilder.andWhere("applicationCategory.category_id = :category_id", {
        category_id,
      });
    }

    if (alias) {
      queryBuilder.andWhere("applicationCategory.alias LIKE :alias", {
        alias: `%${alias}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere("applicationCategory.status = :status", { status });
    }

    // Apply sorting
    const validSortFields = ["order", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "order";
    const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(`applicationCategory.${sortField}`, sortDirection);

    const relationships = await queryBuilder.getMany();

    // Map the results to include display name (alias or original name)
    const relationshipsWithDisplayName = relationships.map((relationship) => ({
      ...relationship,
      display_name: relationship.alias || relationship.category.original_name,
    }));

    return ResponseDto.success(
      "Application-category relationships retrieved successfully",
      relationshipsWithDisplayName
    );
  }

  /**
   * Find application-category relationship by ID
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<ApplicationCategory> {
    const applicationCategory =
      await this.applicationCategoriesRepository.findOne({
        where: { id },
        relations: ["application", "category"],
      });

    if (!applicationCategory) {
      throw new BadRequestException(
        `Application-category relationship with ID ${id} not found`
      );
    }

    return applicationCategory;
  }

  /**
   * Update an application-category relationship
   * @param id
   * @param updateApplicationCategoryDto
   * @returns
   */
  async update(
    id: string,
    updateApplicationCategoryDto: UpdateApplicationCategoryDto
  ): Promise<ApplicationCategory> {
    const applicationCategory = await this.findOne(id);

    // If updating application_id or category_id, check if new relationship already exists
    if (
      updateApplicationCategoryDto.application_id ||
      updateApplicationCategoryDto.category_id
    ) {
      const newApplicationId =
        updateApplicationCategoryDto.application_id ||
        applicationCategory.application_id;
      const newCategoryId =
        updateApplicationCategoryDto.category_id ||
        applicationCategory.category_id;

      if (
        newApplicationId !== applicationCategory.application_id ||
        newCategoryId !== applicationCategory.category_id
      ) {
        const existingRelationship =
          await this.applicationCategoriesRepository.findOne({
            where: {
              application_id: newApplicationId,
              category_id: newCategoryId,
            },
          });
        if (existingRelationship && existingRelationship.id !== id) {
          throw new ConflictException(
            `Application-category relationship already exists`
          );
        }
      }
    }

    Object.assign(applicationCategory, updateApplicationCategoryDto);
    return this.applicationCategoriesRepository.save(applicationCategory);
  }

  /**
   * Remove an application-category relationship
   * @param id
   * @returns
   */
  async remove(id: string): Promise<void> {
    const applicationCategory = await this.findOne(id);
    await this.applicationCategoriesRepository.softRemove(applicationCategory);
  }

  /**
   * Get categories for a specific application
   * @param applicationId
   * @returns
   */
  async getCategoriesByApplication(applicationId: string): Promise<any[]> {
    const relationships = await this.applicationCategoriesRepository.find({
      where: { application_id: applicationId, status: true },
      relations: ["category"],
      order: { order: "ASC" },
    });

    return relationships.map((relationship) => ({
      ...relationship,
      display_name: relationship.alias || relationship.category.original_name,
    }));
  }

  /**
   * Get applications for a specific category
   * @param categoryId
   * @returns
   */
  async getApplicationsByCategory(categoryId: string): Promise<any[]> {
    const relationships = await this.applicationCategoriesRepository.find({
      where: { category_id: categoryId, status: true },
      relations: ["application"],
      order: { order: "ASC" },
    });

    return relationships.map((relationship) => ({
      ...relationship,
      display_name: relationship.alias || relationship.application.name,
    }));
  }
}
