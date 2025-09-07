import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationsService } from "./providers/applications.service";
import { ApplicationAssignmentService } from "./providers/application-assignment.service";
import { AdminConfigService } from "./providers/admin-config.service";
import { ApplicationsController } from "./applications.controller";
import { Application } from "../entities/application.entity";
import { ApplicationAssignment } from "../entities/application-assignment.entity";
import { AdminConfig } from "../entities/admin-config.entity";
import { Users } from "../entities/user.entity";
import { AdminModule } from "../admin/admin.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      ApplicationAssignment,
      Users,
      AdminConfig,
    ]),
    AdminModule,
  ],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    ApplicationAssignmentService,
    AdminConfigService,
  ],
  exports: [
    ApplicationsService,
    ApplicationAssignmentService,
    AdminConfigService,
  ],
})
export class ApplicationsModule implements OnModuleInit {
  constructor(private readonly adminConfigService: AdminConfigService) {}

  async onModuleInit() {
    // Initialize default admin configurations
    await this.adminConfigService.initializeDefaultConfigs();
  }
}
