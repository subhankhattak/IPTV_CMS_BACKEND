import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserTypeEnum } from "../enums/userType.enum";

export class UpdateUserManagementDto {
  @ApiProperty({
    example: "John Doe",
    description: "Name of the user",
    required: false,
  })
  @IsOptional()
  @IsString()
  user_name?: string;

  @ApiProperty({
    example: "1234567890",
    description: "Phone number of the user",
    required: false,
  })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address of the user",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: "newpassword123",
    description: "Password for the user (minimum 6 characters)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: "ADMIN",
    description: "Role of the user",
    enum: UserTypeEnum,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserTypeEnum)
  user_type?: UserTypeEnum;

  @ApiProperty({
    example: true,
    description: "Whether the user is active",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
