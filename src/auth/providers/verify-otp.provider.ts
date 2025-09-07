import { Injectable } from '@nestjs/common';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class VerifyOtpProvider {
  constructor(private readonly userService: UsersService) {}

  public async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    return await this.userService.verifyOTP(verifyOtpDto);
  }
}
