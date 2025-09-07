import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DramasController } from "./dramas.controller";
import { DramasService } from "./providers/dramas.service";
import { Drama } from "../entities/drama.entity";
import { DramaEpisode } from "../entities/drama-episode.entity";
import { Bouquet } from "../entities/bouquet.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Drama, DramaEpisode, Bouquet]),
    AdminModule,
    AuthModule,
  ],
  controllers: [DramasController],
  providers: [DramasService],
  exports: [DramasService],
})
export class DramasModule {}
