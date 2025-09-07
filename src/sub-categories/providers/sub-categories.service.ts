import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SubCategory } from "../../entities/sub-category.entity";
import { Category } from "../../entities/category.entity";
import { CreateSubCategoryDto } from "../dtos/create-sub-category.dto";
import { UpdateSubCategoryDto } from "../dtos/update-sub-category.dto";
import { QuerySubCategoryDto } from "../dtos/query-sub-category.dto";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>
  ) {}

  /**
   * Create a new sub-category
   * @param createSubCategoryDto
   * @returns
   */
  async create(
    createSubCategoryDto: CreateSubCategoryDto
  ): Promise<ResponseDto<SubCategory>> {
    // Check if category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: createSubCategoryDto.category_id },
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    // Check if sub-category with same name already exists for the same category
    const existingSubCategory = await this.subCategoriesRepository.findOne({
      where: {
        original_name: createSubCategoryDto.original_name,
        category_id: createSubCategoryDto.category_id,
      },
    });

    if (existingSubCategory) {
      throw new ConflictException(
        "Sub-category with this name already exists for this category"
      );
    }

    const subCategory =
      this.subCategoriesRepository.create(createSubCategoryDto);
    const savedSubCategory =
      await this.subCategoriesRepository.save(subCategory);
    return ResponseDto.success(
      "Sub-category created successfully",
      savedSubCategory,
      201
    );
  }

  /**
   * Find all sub-categories with optional filters
   * @param queryDto
   * @returns
   */
  async findAll(
    queryDto: QuerySubCategoryDto
  ): Promise<ResponseDto<SubCategory[]>> {
    const {
      name,
      category_id,
      status,
      sortBy = "order",
      sortOrder = "ASC",
    } = queryDto;

    const queryBuilder = this.subCategoriesRepository
      .createQueryBuilder("subCategory")
      .leftJoinAndSelect("subCategory.category", "category");

    // Apply filters
    if (name) {
      queryBuilder.andWhere("subCategory.original_name LIKE :name", {
        name: `%${name}%`,
      });
    }

    if (category_id) {
      queryBuilder.andWhere("subCategory.category_id = :category_id", {
        category_id,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere("subCategory.status = :status", { status });
    }

    // Apply sorting
    const validSortFields = ["original_name", "order", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "order";
    const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(`subCategory.${sortField}`, sortDirection);

    const subCategories = await queryBuilder.getMany();
    return ResponseDto.success(
      "Sub-categories retrieved successfully",
      subCategories
    );
  }

  /**
   * Find sub-category by ID
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<SubCategory> {
    const subCategory = await this.subCategoriesRepository.findOne({
      where: { id },
      relations: ["category"],
    });

    if (!subCategory) {
      throw new BadRequestException("Sub-category not found");
    }

    return subCategory;
  }

  /**
   * Update sub-category by ID
   * @param id
   * @param updateSubCategoryDto
   * @returns
   */
  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto
  ): Promise<SubCategory> {
    const subCategory = await this.findOne(id);

    // Check if category_id is being updated and if the new category exists
    if (updateSubCategoryDto.category_id) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateSubCategoryDto.category_id },
      });

      if (!category) {
        throw new BadRequestException("Category not found");
      }
    }

    // Check if name is being updated and if it conflicts with existing sub-category in the same category
    if (
      updateSubCategoryDto.original_name &&
      updateSubCategoryDto.original_name !== subCategory.original_name
    ) {
      const existingSubCategory = await this.subCategoriesRepository.findOne({
        where: {
          original_name: updateSubCategoryDto.original_name,
          category_id:
            updateSubCategoryDto.category_id || subCategory.category_id,
        },
      });

      if (existingSubCategory) {
        throw new ConflictException(
          "Sub-category with this name already exists for this category"
        );
      }
    }

    Object.assign(subCategory, updateSubCategoryDto);
    return this.subCategoriesRepository.save(subCategory);
  }

  /**
   * Delete sub-category by ID (soft delete)
   * @param id
   * @returns
   */
  async remove(id: string): Promise<void> {
    const subCategory = await this.findOne(id);
    await this.subCategoriesRepository.softRemove(subCategory);
  }

  /**
   * Find sub-categories by category ID
   * @param categoryId
   * @returns
   */
  async findByCategoryId(categoryId: string): Promise<SubCategory[]> {
    return this.subCategoriesRepository.find({
      where: { category_id: categoryId },
      order: { order: "ASC" },
    });
  }

  /**
   * Update sub-category order
   * @param id
   * @param order
   * @returns
   */
  async updateOrder(id: string, order: number): Promise<SubCategory> {
    const subCategory = await this.findOne(id);
    subCategory.order = order;
    return this.subCategoriesRepository.save(subCategory);
  }

  /**
   * Bulk update sub-category orders
   * @param orders Array of {id, order}
   * @returns
   */
  async bulkUpdateOrders(
    orders: { id: string; order: number }[]
  ): Promise<void> {
    for (const { id, order } of orders) {
      await this.updateOrder(id, order);
    }
  }

  /**
   * Bulk delete sub-categories
   * @param ids Array of sub-category IDs
   * @returns
   */
  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.remove(id);
    }
  }
}
