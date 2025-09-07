import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminConfig } from "../../entities/admin-config.entity";

@Injectable()
export class AdminConfigService {
  constructor(
    @InjectRepository(AdminConfig)
    private readonly adminConfigRepository: Repository<AdminConfig>
  ) {}

  /**
   * Initialize default admin configurations for all modules
   */
  async initializeDefaultConfigs(): Promise<void> {
    const defaultConfigs = [
      {
        module_name: "applications",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Applications module - Admin can manage applications",
      },
      {
        module_name: "categories",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Categories module - Admin can manage categories",
      },
      {
        module_name: "sub-categories",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Sub-categories module - Admin can manage sub-categories",
      },
      {
        module_name: "application-categories",
        allow_admin_crud: true,
        admin_view_only: false,
        description:
          "Application-categories module - Admin can manage relationships",
      },
      {
        module_name: "bouquets",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Bouquets module - Admin can manage bouquets",
      },
      {
        module_name: "movies",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Movies module - Admin can manage movies",
      },
      {
        module_name: "series",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Series module - Admin can manage series",
      },
      {
        module_name: "dramas",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Dramas module - Admin can manage dramas",
      },
      {
        module_name: "streams",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Streams module - Admin can manage streams",
      },
      {
        module_name: "radios",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Radios module - Admin can manage radios",
      },
      {
        module_name: "users",
        allow_admin_crud: true,
        admin_view_only: false,
        description: "Users module - Admin can manage users",
      },
    ];

    for (const config of defaultConfigs) {
      const existingConfig = await this.getModuleConfig(config.module_name);
      if (!existingConfig) {
        await this.updateModuleConfig(
          config.module_name,
          config.allow_admin_crud,
          config.admin_view_only
        );
      }
    }
  }

  /**
   * Get admin configuration for a specific module
   * @param moduleName
   * @returns
   */
  async getModuleConfig(moduleName: string): Promise<AdminConfig | null> {
    return this.adminConfigRepository.findOne({
      where: { module_name: moduleName },
    });
  }

  /**
   * Check if admin has CRUD permissions for a module
   * @param moduleName
   * @returns
   */
  async canAdminCRUD(moduleName: string): Promise<boolean> {
    const config = await this.getModuleConfig(moduleName);
    return config?.allow_admin_crud || false;
  }

  /**
   * Check if admin has view-only permissions for a module
   * @param moduleName
   * @returns
   */
  async isAdminViewOnly(moduleName: string): Promise<boolean> {
    const config = await this.getModuleConfig(moduleName);
    return config?.admin_view_only || true;
  }

  /**
   * Update admin configuration for a module
   * @param moduleName
   * @param allowAdminCRUD
   * @param adminViewOnly
   * @returns
   */
  async updateModuleConfig(
    moduleName: string,
    allowAdminCRUD: boolean,
    adminViewOnly: boolean
  ): Promise<AdminConfig> {
    let config = await this.getModuleConfig(moduleName);

    if (!config) {
      config = this.adminConfigRepository.create({
        module_name: moduleName,
        allow_admin_crud: allowAdminCRUD,
        admin_view_only: adminViewOnly,
        description: `Configuration for ${moduleName} module`,
      });
    } else {
      config.allow_admin_crud = allowAdminCRUD;
      config.admin_view_only = adminViewOnly;
    }

    return this.adminConfigRepository.save(config);
  }
}
