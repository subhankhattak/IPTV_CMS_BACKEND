import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserTypeEnum } from "../enums/userType.enum";

export class CreateUserManagementDto {
  @ApiProperty({
    example: "John Doe",
    description: "Name of the user",
  })
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @ApiProperty({
    example: "1234567890",
    description: "Phone number of the user",
  })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address of the user",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "Password for the user (minimum 6 characters)",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: "ADMIN",
    description: "Role of the user",
    enum: UserTypeEnum,
  })
  @IsEnum(UserTypeEnum)
  @IsNotEmpty()
  user_type: UserTypeEnum;

  @ApiProperty({
    example: true,
    description: "Whether the user is active",
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
