import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StreamsController } from "./streams.controller";
import { StreamsService } from "./providers/streams.service";
import { Stream } from "../entities/stream.entity";
import { EpgSource } from "../entities/epg-source.entity";
import { Server } from "../entities/server.entity";
import { Bouquet } from "../entities/bouquet.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Stream, EpgSource, Server, Bouquet]),
    AdminModule,
    AuthModule,
  ],
  controllers: [StreamsController],
  providers: [StreamsService],
  exports: [StreamsService],
})
export class StreamsModule {}
