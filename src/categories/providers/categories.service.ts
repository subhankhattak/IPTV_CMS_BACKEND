import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Category } from "../../entities/category.entity";
import { SubCategory } from "../../entities/sub-category.entity";
import { CreateCategoryDto } from "../dtos/create-category.dto";
import { UpdateCategoryDto } from "../dtos/update-category.dto";
import { QueryCategoryDto } from "../dtos/query-category.dto";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>
  ) {}

  /**
   * Create a new category
   * @param createCategoryDto
   * @returns
   */
  async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<ResponseDto<Category>> {
    // Check if category with same name already exists
    const existingCategory = await this.categoriesRepository.findOne({
      where: {
        original_name: createCategoryDto.original_name,
      },
    });

    if (existingCategory) {
      throw new ConflictException("Category with this name already exists");
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    const savedCategory = await this.categoriesRepository.save(category);
    return ResponseDto.success(
      "Category created successfully",
      savedCategory,
      201
    );
  }

  /**
   * Find all categories with optional filters and sub-category count
   * @param queryDto
   * @returns
   */
  async findAll(queryDto: QueryCategoryDto): Promise<ResponseDto<any[]>> {
    const {
      name,
      use_for,
      status,
      sortBy = "order",
      sortOrder = "ASC",
    } = queryDto;

    const queryBuilder = this.categoriesRepository
      .createQueryBuilder("category")
      .addSelect(
        "(SELECT COUNT(*) FROM sub_categories sc WHERE sc.category_id = category.id AND sc.deleted_at IS NULL)",
        "sub_category_count"
      );

    // Apply filters
    if (name) {
      queryBuilder.andWhere("category.original_name LIKE :name", {
        name: `%${name}%`,
      });
    }

    if (use_for) {
      queryBuilder.andWhere("FIND_IN_SET(:use_for, category.use_for)", {
        use_for,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere("category.status = :status", { status });
    }

    // Apply sorting
    const validSortFields = ["original_name", "order", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "order";
    const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(`category.${sortField}`, sortDirection);

    const categories = await queryBuilder.getMany();
    const subCategoryCounts = await queryBuilder.getRawMany();

    // Map the results to include sub-category count
    const categoriesWithCount = categories.map((category, index) => ({
      ...category,
      sub_category_count: parseInt(
        subCategoryCounts[index]?.sub_category_count || "0"
      ),
    }));

    return ResponseDto.success(
      "Categories retrieved successfully",
      categoriesWithCount
    );
  }

  /**
   * Find category by ID with sub-categories
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ["sub_categories"],
    });

    if (!category) {
      throw new BadRequestException("Category not found");
    }

    return category;
  }

  /**
   * Update category by ID
   * @param id
   * @param updateCategoryDto
   * @returns
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing category
    if (
      updateCategoryDto.original_name &&
      updateCategoryDto.original_name !== category.original_name
    ) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          original_name: updateCategoryDto.original_name,
        },
      });

      if (existingCategory) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  /**
   * Delete category by ID (soft delete)
   * @param id
   * @returns
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check for linked sub-categories before deleting
    const subCategoryCount = await this.subCategoriesRepository.count({
      where: { category_id: id },
    });

    if (subCategoryCount > 0) {
      throw new BadRequestException(
        "Cannot delete category with linked sub-categories. Please remove all sub-categories first."
      );
    }

    await this.categoriesRepository.softRemove(category);
  }

  /**
   * Find categories by use for type
   * @param useFor
   * @returns
   */
  async findByUseFor(useFor: string): Promise<Category[]> {
    return this.categoriesRepository
      .createQueryBuilder("category")
      .where("FIND_IN_SET(:useFor, category.use_for)", { useFor })
      .getMany();
  }

  /**
   * Update category order
   * @param id
   * @param order
   * @returns
   */
  async updateOrder(id: string, order: number): Promise<Category> {
    const category = await this.findOne(id);
    category.order = order;
    return this.categoriesRepository.save(category);
  }

  /**
   * Bulk update category orders
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
   * Bulk delete categories
   * @param ids Array of category IDs
   * @returns
   */
  async bulkDelete(ids: string[]): Promise<void> {
    // Check for linked sub-categories for all categories
    for (const id of ids) {
      const subCategoryCount = await this.subCategoriesRepository.count({
        where: { category_id: id },
      });

      if (subCategoryCount > 0) {
        const category = await this.findOne(id);
        throw new BadRequestException(
          `Cannot delete category "${category.original_name}" with linked sub-categories. Please remove all sub-categories first.`
        );
      }
    }

    // Delete all categories
    await this.categoriesRepository.softRemove(
      await this.categoriesRepository.find({
        where: { id: In(ids) },
      })
    );
  }
}
