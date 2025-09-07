import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeriesController } from "./series.controller";
import { SeriesService } from "./providers/series.service";
import { Series } from "../entities/series.entity";
import { Season } from "../entities/season.entity";
import { Episode } from "../entities/episode.entity";
import { Bouquet } from "../entities/bouquet.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Series, Season, Episode, Bouquet]),
    AdminModule,
    AuthModule,
  ],
  controllers: [SeriesController],
  providers: [SeriesService],
  exports: [SeriesService],
})
export class SeriesModule {}
