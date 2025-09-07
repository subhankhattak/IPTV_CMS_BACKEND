import { typeOrmConfig } from "../config/typeorm.config";

const { DataSource } = require("typeorm");

const connectionSource = new DataSource(typeOrmConfig);
module.exports = connectionSource; //export the connection source
