import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminConfig } from "../entities/admin-config.entity";
import { AdminConfigService } from "../applications/providers/admin-config.service";

@Module({
  imports: [TypeOrmModule.forFeature([AdminConfig])],
  providers: [AdminConfigService],
  exports: [AdminConfigService],
})
export class AdminModule {}
