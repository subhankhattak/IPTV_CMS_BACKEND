import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, In } from "typeorm";
import { Application } from "../../entities/application.entity";
import { CreateApplicationDto } from "../dtos/create-application.dto";
import { UpdateApplicationDto } from "../dtos/update-application.dto";
import { QueryApplicationDto } from "../dtos/query-application.dto";
import { ApplicationAssignmentService } from "./application-assignment.service";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepository: Repository<Application>,
    private readonly assignmentService: ApplicationAssignmentService
  ) {}

  /**
   * Create a new application
   * @param createApplicationDto
   * @returns
   */
  async create(
    createApplicationDto: CreateApplicationDto
  ): Promise<ResponseDto<Application>> {
    // Check if application with same name already exists
    const existingApplication = await this.applicationsRepository.findOne({
      where: { name: createApplicationDto.name },
    });

    if (existingApplication) {
      throw new ConflictException("Application with this name already exists");
    }

    const application =
      this.applicationsRepository.create(createApplicationDto);
    const savedApplication =
      await this.applicationsRepository.save(application);
    return ResponseDto.success(
      "Application created successfully",
      savedApplication,
      201
    );
  }

  /**
   * Find all applications with optional filters
   * @param queryDto
   * @returns
   */
  async findAll(
    queryDto: QueryApplicationDto
  ): Promise<ResponseDto<Application[]>> {
    const {
      name,
      status,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder =
      this.applicationsRepository.createQueryBuilder("application");

    // Apply filters
    if (name) {
      queryBuilder.andWhere("application.name LIKE :name", {
        name: `%${name}%`,
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere("application.status = :status", { status });
    }

    // Apply sorting
    const validSortFields = ["name", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(`application.${sortField}`, sortDirection);

    const applications = await queryBuilder.getMany();
    return ResponseDto.success(
      "Applications retrieved successfully",
      applications
    );
  }

  /**
   * Find application by ID
   * @param id
   * @returns
   */
  async findOne(id: string): Promise<ResponseDto<Application>> {
    const application = await this.applicationsRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new BadRequestException("Application not found");
    }

    return ResponseDto.success(
      "Application retrieved successfully",
      application
    );
  }

  /**
   * Update application by ID
   * @param id
   * @param updateApplicationDto
   * @returns
   */
  async update(
    id: string,
    updateApplicationDto: UpdateApplicationDto
  ): Promise<ResponseDto<Application>> {
    const applicationResponse = await this.findOne(id);
    const application = applicationResponse.data;

    // Check if name is being updated and if it conflicts with existing application
    if (
      updateApplicationDto.name &&
      updateApplicationDto.name !== application.name
    ) {
      const existingApplication = await this.applicationsRepository.findOne({
        where: { name: updateApplicationDto.name },
      });

      if (existingApplication) {
        throw new ConflictException(
          "Application with this name already exists"
        );
      }
    }

    Object.assign(application, updateApplicationDto);
    const updatedApplication =
      await this.applicationsRepository.save(application);
    return ResponseDto.success(
      "Application updated successfully",
      updatedApplication
    );
  }

  /**
   * Delete application by ID (soft delete)
   * @param id
   * @returns
   */
  async remove(id: string): Promise<ResponseDto<void>> {
    const applicationResponse = await this.findOne(id);
    const application = applicationResponse.data;

    // Check for active assignments before deleting
    const hasActiveAssignments =
      await this.assignmentService.hasActiveAssignments(id);
    if (hasActiveAssignments) {
      throw new BadRequestException(
        "Cannot delete application with active assignments. Please remove all assignments first."
      );
    }

    await this.applicationsRepository.softRemove(application);
    return ResponseDto.success("Application deleted successfully");
  }

  /**
   * Bulk delete applications
   * @param ids
   * @returns
   */
  async bulkDelete(ids: string[]): Promise<ResponseDto<void>> {
    // Check for active assignments for all applications
    for (const id of ids) {
      const hasActiveAssignments =
        await this.assignmentService.hasActiveAssignments(id);
      if (hasActiveAssignments) {
        const applicationResponse = await this.findOne(id);
        const application = applicationResponse.data;
        throw new BadRequestException(
          `Cannot delete application "${application.name}" with active assignments. Please remove all assignments first.`
        );
      }
    }

    // Delete all applications
    await this.applicationsRepository.softRemove(
      await this.applicationsRepository.find({
        where: { id: In(ids) },
      })
    );
    return ResponseDto.success("Applications deleted successfully");
  }

  /**
   * Bulk update application status
   * @param ids
   * @param status
   * @returns
   */
  async bulkUpdateStatus(
    ids: string[],
    status: boolean
  ): Promise<ResponseDto<void>> {
    await this.applicationsRepository.update({ id: In(ids) }, { status });
    return ResponseDto.success("Application status updated successfully");
  }

  /**
   * Find application by name
   * @param name
   * @returns
   */
  async findByName(name: string): Promise<Application | null> {
    return this.applicationsRepository.findOne({
      where: { name },
    });
  }

  /**
   * Find application by user agent
   * @param userAgent
   * @returns
   */
  async findByUserAgent(userAgent: string): Promise<Application | null> {
    return this.applicationsRepository.findOne({
      where: { user_agent: userAgent },
    });
  }
}
