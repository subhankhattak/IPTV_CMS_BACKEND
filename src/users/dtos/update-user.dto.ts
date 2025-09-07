import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Id of the user to be updated',
    required: true,
    example: '66fd8a038f7b2b05045c028b',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}
