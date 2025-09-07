import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationSubCategoriesController } from "./application-sub-categories.controller";
import { ApplicationSubCategoriesService } from "./providers/application-sub-categories.service";
import { ApplicationSubCategory } from "../entities/application-sub-category.entity";
import { Application } from "../entities/application.entity";
import { SubCategory } from "../entities/sub-category.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationSubCategory,
      Application,
      SubCategory,
    ]),
    AuthModule,
  ],
  controllers: [ApplicationSubCategoriesController],
  providers: [ApplicationSubCategoriesService],
  exports: [ApplicationSubCategoriesService],
})
export class ApplicationSubCategoriesModule {}
