import { registerAs } from "@nestjs/config";

require("dotenv").config(); // Load .env variables

export const typeOrmConfig = {
  type: "mysql",
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  username: process.env.DATABASE_USERNAME || "mysql",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE || "iptv",
  entities: [__dirname + "/../../**/*.entity{.js,.ts}"], // Use __dirname for paths
  // migrations: [__dirname + "/../config/../migrations/*{.js,.ts}"], // Use __dirname for paths
  migrationsRun: false,
  synchronize: true,
  logging: false,
  timezone: "Z", // Use UTC timezone
  extra: {
    // MySQL specific options to handle timestamp columns properly
    charset: "utf8mb4",
    timezone: "Z",
  },
};

export default registerAs("typeorm", () => typeOrmConfig);
