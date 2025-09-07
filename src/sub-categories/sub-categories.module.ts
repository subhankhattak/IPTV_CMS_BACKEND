import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubCategoriesService } from "./providers/sub-categories.service";
import { SubCategoriesController } from "./sub-categories.controller";
import { SubCategory } from "../entities/sub-category.entity";
import { Category } from "../entities/category.entity";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory, Category]), AdminModule],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}
