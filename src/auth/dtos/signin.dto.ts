import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({
    description: 'User email to login',
    example: 'jonedoe@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password to login',
    example: 'Pass@12e',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
