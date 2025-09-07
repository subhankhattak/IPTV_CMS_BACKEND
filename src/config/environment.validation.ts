import * as Joi from "joi";
export default Joi.object({
  NODE_ENV: Joi.string()
    .valid("LOCAL", "DEV", "STAGING", "PROD")
    .default("LOCAL"),
  PORT: Joi.number().greater(1024),
  API_VERSION: Joi.string().required(),
  DATABASE_TYPE: Joi.string().valid("mysql").required(),
  DATABASE_HOST: Joi.string().hostname().required(),
  DATABASE_PORT: Joi.number().port().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().optional().allow(""),
  DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.number().required(),
  SWAGGER_USER: Joi.string().optional(),
  SWAGGER_PASSWORD: Joi.string().optional(),
  REDIS_HOST: Joi.string().hostname().required(),
  REDIS_PORT: Joi.number().port().required().default(6379),
  SERVER_URL: Joi.string().required().uri(),
});
