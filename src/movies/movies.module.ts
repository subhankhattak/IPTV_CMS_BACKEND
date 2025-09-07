import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./providers/movies.service";
import { Movie } from "../entities/movie.entity";
import { Bouquet } from "../entities/bouquet.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, Bouquet]),
    AdminModule,
    AuthModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
