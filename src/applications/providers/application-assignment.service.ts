import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApplicationAssignment } from "../../entities/application-assignment.entity";
import { Application } from "../../entities/application.entity";
import { Users } from "../../entities/user.entity";
import { CreateApplicationAssignmentDto } from "../dtos/create-application-assignment.dto";
import { UserTypeEnum } from "../../users/enums/userType.enum";
import { ResponseDto } from "../../common/dtos/response.dto";

@Injectable()
export class ApplicationAssignmentService {
  constructor(
    @InjectRepository(ApplicationAssignment)
    private readonly assignmentRepository: Repository<ApplicationAssignment>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>
  ) {}

  /**
   * Create a new application assignment
   * @param createAssignmentDto
   * @returns
   */
  async create(
    createAssignmentDto: CreateApplicationAssignmentDto
  ): Promise<ResponseDto<ApplicationAssignment>> {
    // Check if application exists
    const application = await this.applicationRepository.findOne({
      where: { id: createAssignmentDto.application_id },
    });

    if (!application) {
      throw new BadRequestException("Application not found");
    }

    // Check if reseller exists and is a reseller or sub-reseller
    const reseller = await this.userRepository.findOne({
      where: { id: createAssignmentDto.reseller_id },
    });

    if (!reseller) {
      throw new BadRequestException("Reseller not found");
    }

    // Check if assignment already exists
    const existingAssignment = await this.assignmentRepository.findOne({
      where: {
        application_id: createAssignmentDto.application_id,
        reseller_id: createAssignmentDto.reseller_id,
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        "Application is already assigned to this reseller"
      );
    }

    const assignment = this.assignmentRepository.create(createAssignmentDto);
    const savedAssignment = await this.assignmentRepository.save(assignment);
    return ResponseDto.success(
      "Application assigned successfully",
      savedAssignment,
      201
    );
  }

  /**
   * Get applications assigned to a reseller
   * @param resellerId
   * @returns
   */
  async getAssignedApplications(
    resellerId: string
  ): Promise<ResponseDto<Application[]>> {
    const assignments = await this.assignmentRepository.find({
      where: { reseller_id: resellerId, status: true },
      relations: ["application"],
    });

    // Return only basic application info for resellers (name, logo, status)
    const applications = assignments.map(
      (assignment) =>
        ({
          id: assignment.application.id,
          name: assignment.application.name,
          logo_path: assignment.application.logo_path,
          status: assignment.application.status,
          assignment_type: assignment.assignment_type,
          price: assignment.price,
          theme_variant: assignment.theme_variant,
          created_at: assignment.application.created_at,
          updated_at: assignment.application.updated_at,
        }) as any
    );

    return ResponseDto.success(
      "Assigned applications retrieved successfully",
      applications
    );
  }

  /**
   * Get all assignments for an application
   * @param applicationId
   * @returns
   */
  async getApplicationAssignments(
    applicationId: string
  ): Promise<ResponseDto<ApplicationAssignment[]>> {
    const assignments = await this.assignmentRepository.find({
      where: { application_id: applicationId },
      relations: ["reseller"],
    });
    return ResponseDto.success(
      "Application assignments retrieved successfully",
      assignments
    );
  }

  /**
   * Remove an application assignment
   * @param assignmentId
   * @returns
   */
  async removeAssignment(assignmentId: string): Promise<ResponseDto<void>> {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new BadRequestException("Assignment not found");
    }

    await this.assignmentRepository.softRemove(assignment);
    return ResponseDto.success("Assignment removed successfully");
  }

  /**
   * Check if application has active assignments
   * @param applicationId
   * @returns
   */
  async hasActiveAssignments(applicationId: string): Promise<boolean> {
    const count = await this.assignmentRepository.count({
      where: { application_id: applicationId, status: true },
    });
    return count > 0;
  }
}
