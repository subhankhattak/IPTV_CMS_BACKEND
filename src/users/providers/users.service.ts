import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { FindOneUserByEmailProvider } from './find-one-user-by-email.provider';
import { RegisterUserProvider } from './register-user.providre';
import { VerifyOtpDto } from '../../auth/dtos/verify-otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    /**
     * Injecting Find by email provider
     */
    private readonly findOneUserByEmailProvider: FindOneUserByEmailProvider,
    /**
     * Injecting register user provider
     */
    private readonly registerUserProvider: RegisterUserProvider,

    /**
     * Injecting user repository
     */
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}
  /**
   * Create new user service
   * @param createUserDto
   * @returns
   */
  public async createUser(createUserDto: CreateUserDto) {
    return this.registerUserProvider.create(createUserDto);
  }

  public findByEmail(email: string) {
    return this.findOneUserByEmailProvider.findByEmail(email);
  }

  public findOneById(id: string) {
    return this.usersRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async forgetPassword(phoneNumber: string) {
    // try {
    //   const user = await this.usersRepository.findOne({
    //     where: {
    //       phone_number: phoneNumber,
    //       deleted_at: null,
    //     },
    //   });
    //   if (!user) {
    //     throw new BadRequestException('User not found');
    //   }
    //   const generateOtpDto = new GenerateOtpDto();
    //   generateOtpDto.type = OTPType.PHONE;
    //   generateOtpDto.userId = user._id.toString();
    //   return await this.otpService.generateOtp(generateOtpDto);
    // } catch (err) {
    //   if (err instanceof BadRequestException) throw err;
    //   throw new InternalServerErrorException(err['message']);
    // }
  }

  public async verifyOTP(verifyOtpDto: VerifyOtpDto) {
    // try {
    //   const user = await this.userModel.findOne({
    //     phoneNumber: verifyOtpDto.phoneNumber,
    //     deletedAt: null,
    //   });
    //   if (!user) {
    //     throw new BadRequestException('User not found');
    //   }
    //   const validateOtp = new ValidateOtpDto();
    //   validateOtp.type = OTPType.PHONE;
    //   validateOtp.userId = user._id.toString();
    //   validateOtp.otp = verifyOtpDto.otp;
    //   return await this.otpService.validateOtp(validateOtp);
    // } catch (err) {
    //   if (err instanceof BadRequestException) throw err;
    //   throw new InternalServerErrorException(err['message']);
    // }
  }

  public async updatePassword(phoneNumber: string, password: string) {
    // try {
    //   const user = await this.userModel.findOne({
    //     phoneNumber,
    //     deletedAt: null,
    //   });
    //   if (!user) {
    //     throw new BadRequestException('User not found');
    //   }
    //   user.password = password;
    //   return await user.save();
    // } catch (err) {
    //   if (err instanceof BadRequestException) throw err;
    //   throw new InternalServerErrorException(err['message']);
    // }
  }
}
