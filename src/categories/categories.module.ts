import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoriesService } from "./providers/categories.service";
import { CategoriesController } from "./categories.controller";
import { Category } from "../entities/category.entity";
import { SubCategory } from "../entities/sub-category.entity";
import { ApplicationCategory } from "../entities/application-category.entity";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, SubCategory, ApplicationCategory]),
    AdminModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
