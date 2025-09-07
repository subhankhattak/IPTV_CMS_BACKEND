import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RadiosController } from "./radios.controller";
import { RadiosService } from "./providers/radios.service";
import { Radio } from "../entities/radio.entity";
import { Bouquet } from "../entities/bouquet.entity";
import { AdminModule } from "../admin/admin.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Radio, Bouquet]),
    AdminModule,
    AuthModule,
  ],
  controllers: [RadiosController],
  providers: [RadiosService],
  exports: [RadiosService],
})
export class RadiosModule {}
