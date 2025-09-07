import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationCategoriesService } from "./providers/application-categories.service";
import { ApplicationCategoriesController } from "./application-categories.controller";
import { ApplicationCategory } from "../entities/application-category.entity";
import { Application } from "../entities/application.entity";
import { Category } from "../entities/category.entity";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationCategory, Application, Category]),
    AdminModule,
  ],
  controllers: [ApplicationCategoriesController],
  providers: [ApplicationCategoriesService],
  exports: [ApplicationCategoriesService],
})
export class ApplicationCategoriesModule {}
