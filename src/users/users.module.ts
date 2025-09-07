import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./providers/users.service";
import { UsersController } from "./users.controller";
import { FindOneUserByEmailProvider } from "./providers/find-one-user-by-email.provider";
import { RegisterUserProvider } from "./providers/register-user.providre";
import { UserManagementService } from "./providers/user-management.service";
import { InitSuperAdminService } from "./providers/init-super-admin.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Users } from "src/entities/user.entity";
import { AuthModule } from "src/auth/auth.module";
import { HashingProvider } from "src/auth/providers/hashing.provider";
import { ApplicationsModule } from "src/applications/applications.module";

@Module({
  providers: [
    UsersService,
    FindOneUserByEmailProvider,
    RegisterUserProvider,
    UserManagementService,
    InitSuperAdminService,
  ],
  controllers: [UsersController],
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([Users]),
    ApplicationsModule,
  ],
  exports: [UsersService, RegisterUserProvider, UserManagementService],
})
export class UsersModule {}
