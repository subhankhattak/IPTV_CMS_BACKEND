import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token provided at the time of login',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
