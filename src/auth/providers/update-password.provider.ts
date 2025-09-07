import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/providers/users.service';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { HashingProvider } from './hashing.provider';

@Injectable()
export class UpdatePasswordProvider {
  constructor(
    private userService: UsersService,
    private readonly hashingProvider: HashingProvider,
  ) {}

  public async updatePassword(updatePasswordDto: UpdatePasswordDto) {
    updatePasswordDto.password = await this.hashingProvider.hashPassword(
      updatePasswordDto.password,
    );
    return await this.userService.updatePassword(
      updatePasswordDto.phoneNumber,
      updatePasswordDto.password,
    );
  }
}
