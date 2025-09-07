import { Injectable } from '@nestjs/common';
import { ForgetPasswordDto } from '../dtos/forget-password.dto';
import { UsersService } from '../../users/providers/users.service';

@Injectable()
export class ForgetPasswordProvider {
  constructor(private readonly usersService: UsersService) {}

  public async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    await this.usersService.forgetPassword(forgetPasswordDto.phoneNumber);
  }
}
