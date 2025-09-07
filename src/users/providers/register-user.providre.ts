import { BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Repository } from 'typeorm';
import { Users } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class RegisterUserProvider {
  constructor(
    /**
     * Injecting user model
     */
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  /**
   * Creates a new user after validating and hashing the password.
   * @param createUserDto - DTO containing user details.
   * @returns The created user document.
   */
  async create(createUserDto: CreateUserDto): Promise<Users> {
    const { email } = createUserDto;
    // Check if email already exists
    const existingUser = await this.usersRepository.findOne({
      where: {
        email,
        deleted_at: null,
      },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }
    const user = this.usersRepository.create({
      user_name: createUserDto.userName,
      phone_number: createUserDto.phoneNumber,
      email: createUserDto.email,
      password: createUserDto.password,
    });
    return await this.usersRepository.save(user);
  }
}
