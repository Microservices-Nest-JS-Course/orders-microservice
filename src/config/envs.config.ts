import 'dotenv/config';
import * as joi from 'joi';

interface EnvsVars {
  PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  PRODUCTS_MICROSERVICE_HOST: string;
  PRODUCTS_MICROSERVICE_PORT: number;
  NATS_SERVERS: string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
    PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const validationResult = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (validationResult.error)
  throw new Error(`Config validation error: ${validationResult.error.message}`);

const envVars: EnvsVars = validationResult.value as EnvsVars;

export const envs = {
  server: {
    port: envVars.PORT,
  },
  db: {
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
  },
  microservices: {
    products: {
      host: envVars.PRODUCTS_MICROSERVICE_HOST,
      port: envVars.PRODUCTS_MICROSERVICE_PORT,
    },
  },
  messaging: {
    options: {
      NATS: {
        servers: envVars.NATS_SERVERS,
      },
    },
  },
};
