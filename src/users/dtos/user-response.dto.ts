import { ApiProperty } from "@nestjs/swagger";
import { UserTypeEnum } from "../enums/userType.enum";

export class UserResponseDto {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Unique identifier for the user",
  })
  id: string;

  @ApiProperty({
    example: "John Doe",
    description: "Name of the user",
  })
  user_name: string;

  @ApiProperty({
    example: "1234567890",
    description: "Phone number of the user",
  })
  phone_number: string;

  @ApiProperty({
    example: "john.doe@example.com",
    description: "Email address of the user",
  })
  email: string;

  @ApiProperty({
    example: "SUPER_ADMIN",
    description: "Role of the user",
    enum: UserTypeEnum,
  })
  user_type: UserTypeEnum;

  @ApiProperty({
    example: true,
    description: "Whether the user is active",
  })
  active: boolean;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the user was created",
  })
  created_at: Date;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the user was last updated",
  })
  updated_at: Date;

  @ApiProperty({
    example: null,
    description: "When the user was deleted (soft delete)",
    required: false,
  })
  deleted_at?: Date;
}
