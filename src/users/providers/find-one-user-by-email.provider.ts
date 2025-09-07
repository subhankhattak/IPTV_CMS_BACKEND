import {
  Injectable,
  RequestTimeoutException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class FindOneUserByEmailProvider {
  constructor(
    /**
     * inject user repo
     */
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>
  ) {}

  public async findByEmail(email: string): Promise<Users | null | undefined> {
    let user: Users | undefined = undefined;
    try {
      // Use ILIKE for case-insensitive email search
      user = await this.usersRepository
        .createQueryBuilder("user")
        .where("LOWER(user.email) = LOWER(:email)", { email })
        .andWhere("user.deleted_at IS NULL")
        .getOne();
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: "Could not fetch the user",
      });
    }
    //throw an exception user not found
    if (!user) {
      throw new UnauthorizedException("User not exist");
    }
    return user;
  }
}
