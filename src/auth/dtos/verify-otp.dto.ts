// src/dto/validate-otp.dto.ts
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
// import { OTPType } from '../../otp/enums/otp-type.enum';

/**
 * DTO for validating an OTP.
 */
export class VerifyOtpDto {
  @ApiProperty({
    example: '1234567890',
    description: 'Phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123456', description: 'The OTP to be validated' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    example: 'EMAIL',
    enum: [],
    description: 'The type of OTP (EMAIL or PHONE)',
  })
  @IsEnum([])
  @IsNotEmpty()
  type: [];
}
