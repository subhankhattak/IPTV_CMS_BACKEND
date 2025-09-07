import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/providers/users.service';
import { HashingProvider } from './hashing.provider';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { CreateUserDto } from '../../users/dtos/create-user.dto';

@Injectable()
export class RegisterProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingProvider: HashingProvider,
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  public async register(createUserDto: CreateUserDto) {
    createUserDto.password = await this.hashingProvider.hashPassword(
      createUserDto.password,
    );
    const user = await this.usersService.createUser(createUserDto);
    return await this.generateTokensProvider.generateTokens(user);
  }
}
