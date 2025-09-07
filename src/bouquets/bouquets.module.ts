import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BouquetsController } from "./bouquets.controller";
import { BouquetsService } from "./providers/bouquets.service";
import { Bouquet } from "../entities/bouquet.entity";
import { BouquetMergeLog } from "../entities/bouquet-merge-log.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Bouquet, BouquetMergeLog]), AdminModule, AuthModule],
  controllers: [BouquetsController],
  providers: [BouquetsService],
  exports: [BouquetsService],
})
export class BouquetsModule {}
