import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ForgetPasswordDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
