import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'password123', description: 'Password for the user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
