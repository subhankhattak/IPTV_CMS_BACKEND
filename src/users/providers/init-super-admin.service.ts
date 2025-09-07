import { Injectable, OnModuleInit } from "@nestjs/common";
import { UserManagementService } from "./user-management.service";

@Injectable()
export class InitSuperAdminService implements OnModuleInit {
  constructor(private readonly userManagementService: UserManagementService) {}

  async onModuleInit() {
    console.log("Initializing default Super Admin...");
    await this.userManagementService.createDefaultSuperAdmin();
    console.log("Super Admin initialization completed.");
  }
}
