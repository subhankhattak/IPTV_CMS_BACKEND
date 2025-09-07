// src/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserTypeEnum } from '../enums/userType.enum';

/**
 * Data Transfer Object (DTO) for creating a new user.
 * Contains validation rules for incoming user data.
 */
export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Name of the user' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password for the user' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '64f5b2d8f7a67c001a123123', description: 'Role ID' })
  @IsNotEmpty()
  roleId: string;
}
