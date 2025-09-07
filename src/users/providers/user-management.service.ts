import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Users } from "../../entities/user.entity";
import { UserTypeEnum } from "../enums/userType.enum";
import { HashingProvider } from "../../auth/providers/hashing.provider";
import { ResponseDto } from "../../common/dtos/response.dto";
import { UserResponseDto } from "../dtos/user-response.dto";

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly hashingProvider: HashingProvider
  ) {}

  /**
   * Create default super admin if none exists
   */
  async createDefaultSuperAdmin(): Promise<void> {
    const existingSuperAdmin = await this.usersRepository.findOne({
      where: { user_type: UserTypeEnum.SUPER_ADMIN },
    });

    if (!existingSuperAdmin) {
      const hashedPassword =
        await this.hashingProvider.hashPassword("Pass@123");

      const superAdmin = this.usersRepository.create({
        user_name: "Super Admin",
        phone_number: "1234567890",
        email: "superadmin@example.com",
        password: hashedPassword,
        user_type: UserTypeEnum.SUPER_ADMIN,
        active: true,
      });

      await this.usersRepository.save(superAdmin);
      console.log("Default Super Admin created successfully");
    }
  }

  /**
   * Create a new user with role validation
   */
  async createUser(
    createUserDto: any,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<UserResponseDto>> {
    // Validate role hierarchy
    this.validateRoleHierarchy(currentUserType, createUserDto.user_type);

    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Check if phone number already exists
    const existingPhone = await this.usersRepository.findOne({
      where: { phone_number: createUserDto.phone_number },
    });

    if (existingPhone) {
      throw new ConflictException("Phone number already exists");
    }

    // Hash password
    const hashedPassword = await this.hashingProvider.hashPassword(
      createUserDto.password
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);
    const userData = Array.isArray(savedUser) ? savedUser[0] : savedUser;
    return ResponseDto.success(
      "User created successfully",
      this.sanitizeUser(userData),
      201
    );
  }

  /**
   * Get all users with role-based filtering
   */
  async getAllUsers(
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<UserResponseDto[]>> {
    let query = this.usersRepository.createQueryBuilder("user");

    // Apply role-based filtering
    switch (currentUserType) {
      case UserTypeEnum.SUPER_ADMIN:
        // Super admin can see all users
        break;
      case UserTypeEnum.ADMIN:
        // Admin can see all users except super admin
        query = query.where("user.user_type != :superAdmin", {
          superAdmin: UserTypeEnum.SUPER_ADMIN,
        });
        break;
      case UserTypeEnum.RESELLER:
        // Reseller can only see sub-resellers and users
        query = query.where("user.user_type IN (:...allowedTypes)", {
          allowedTypes: [UserTypeEnum.SUB_RESELLER, UserTypeEnum.USER],
        });
        break;
      case UserTypeEnum.SUB_RESELLER:
        // Sub-reseller can only see users
        query = query.where("user.user_type = :userType", {
          userType: UserTypeEnum.USER,
        });
        break;
      case UserTypeEnum.USER:
        // Users cannot see other users
        throw new ForbiddenException("Users cannot access user management.");
      default:
        throw new BadRequestException("Invalid user type");
    }

    const users = await query.getMany();
    return ResponseDto.success(
      "Users retrieved successfully",
      this.sanitizeUsers(users)
    );
  }

  /**
   * Get user by ID with role validation
   */
  async getUserById(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<UserResponseDto>> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    // Validate access based on role hierarchy
    this.validateUserAccess(currentUserType, user.user_type);

    return ResponseDto.success(
      "User retrieved successfully",
      this.sanitizeUser(user)
    );
  }

  /**
   * Update user with role validation
   */
  async updateUser(
    id: string,
    updateUserDto: any,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<UserResponseDto>> {
    // Get the original user from database for validation
    const originalUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!originalUser) {
      throw new BadRequestException("User not found");
    }

    // Validate access based on role hierarchy
    this.validateUserAccess(currentUserType, originalUser.user_type);

    // Check if trying to deactivate or downgrade super admin
    if (originalUser.user_type === UserTypeEnum.SUPER_ADMIN) {
      const isDeactivating = updateUserDto.active === false;
      const isDowngrading =
        updateUserDto.user_type &&
        updateUserDto.user_type !== UserTypeEnum.SUPER_ADMIN;

      if (isDeactivating || isDowngrading) {
        // Count other active super admins (excluding current user)
        const otherSuperAdminCount = await this.usersRepository.count({
          where: {
            user_type: UserTypeEnum.SUPER_ADMIN,
            active: true,
            deleted_at: null,
            id: Not(originalUser.id), // Exclude current user
          },
        });

        if (otherSuperAdminCount === 0) {
          throw new BadRequestException(
            "Cannot perform this action. At least one active Super Admin must exist in the system."
          );
        }
      }
    }

    // Validate role hierarchy if user type is being changed
    if (
      updateUserDto.user_type &&
      updateUserDto.user_type !== originalUser.user_type
    ) {
      this.validateRoleHierarchy(currentUserType, updateUserDto.user_type);
    }

    // Check email uniqueness if being updated
    if (updateUserDto.email && updateUserDto.email !== originalUser.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Email already exists");
      }
    }

    // Check phone number uniqueness if being updated
    if (
      updateUserDto.phone_number &&
      updateUserDto.phone_number !== originalUser.phone_number
    ) {
      const existingUser = await this.usersRepository.findOne({
        where: { phone_number: updateUserDto.phone_number },
      });

      if (existingUser) {
        throw new ConflictException("Phone number already exists");
      }
    }

    // Hash password if being updated
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashingProvider.hashPassword(
        updateUserDto.password
      );
    }

    Object.assign(originalUser, updateUserDto);
    const updatedUser = await this.usersRepository.save(originalUser);
    return ResponseDto.success(
      "User updated successfully",
      this.sanitizeUser(updatedUser)
    );
  }

  /**
   * Delete user with role validation
   */
  async deleteUser(
    id: string,
    currentUserType: UserTypeEnum
  ): Promise<ResponseDto<void>> {
    const userResponse = await this.getUserById(id, currentUserType);
    const user = userResponse.data;

    // Prevent super admin from being deleted
    if (user.user_type === UserTypeEnum.SUPER_ADMIN) {
      throw new BadRequestException("Super Admin cannot be deleted");
    }

    // Prevent self-deletion
    if (user.user_type === currentUserType) {
      throw new BadRequestException("Cannot delete your own account");
    }

    await this.usersRepository.softRemove(user);
    return ResponseDto.success("User deleted successfully");
  }

  /**
   * Check if there's at least one active super admin
   */
  private async ensureSuperAdminExists(): Promise<void> {
    const superAdminCount = await this.usersRepository.count({
      where: {
        user_type: UserTypeEnum.SUPER_ADMIN,
        active: true,
        deleted_at: null,
      },
    });

    if (superAdminCount === 0) {
      throw new BadRequestException(
        "Cannot perform this action. At least one active Super Admin must exist in the system."
      );
    }
  }

  /**
   * Sanitize user data by removing sensitive fields
   */
  private sanitizeUser(user: Users): UserResponseDto {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as UserResponseDto;
  }

  /**
   * Sanitize array of users
   */
  private sanitizeUsers(users: Users[]): UserResponseDto[] {
    return users.map((user) => this.sanitizeUser(user));
  }

  /**
   * Validate role hierarchy for user creation/update
   */
  private validateRoleHierarchy(
    currentUserType: UserTypeEnum,
    targetUserType: UserTypeEnum
  ): void {
    const roleHierarchy = {
      [UserTypeEnum.SUPER_ADMIN]: [
        UserTypeEnum.ADMIN,
        UserTypeEnum.RESELLER,
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
      [UserTypeEnum.ADMIN]: [
        UserTypeEnum.RESELLER,
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
      [UserTypeEnum.RESELLER]: [UserTypeEnum.SUB_RESELLER, UserTypeEnum.USER],
      [UserTypeEnum.SUB_RESELLER]: [UserTypeEnum.USER],
    };

    const allowedRoles = roleHierarchy[currentUserType];
    if (!allowedRoles || !allowedRoles.includes(targetUserType)) {
      throw new ForbiddenException(
        `You cannot create users with role: ${targetUserType}`
      );
    }
  }

  /**
   * Validate user access based on role hierarchy
   */
  private validateUserAccess(
    currentUserType: UserTypeEnum,
    targetUserType: UserTypeEnum
  ): void {
    const accessMatrix = {
      [UserTypeEnum.SUPER_ADMIN]: [
        UserTypeEnum.SUPER_ADMIN,
        UserTypeEnum.ADMIN,
        UserTypeEnum.RESELLER,
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
      [UserTypeEnum.ADMIN]: [
        UserTypeEnum.ADMIN,
        UserTypeEnum.RESELLER,
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
      [UserTypeEnum.RESELLER]: [
        UserTypeEnum.RESELLER,
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
      [UserTypeEnum.SUB_RESELLER]: [
        UserTypeEnum.SUB_RESELLER,
        UserTypeEnum.USER,
      ],
    };

    const allowedAccess = accessMatrix[currentUserType];
    if (!allowedAccess || !allowedAccess.includes(targetUserType)) {
      throw new ForbiddenException(
        `You cannot access users with role: ${targetUserType}`
      );
    }
  }
}
