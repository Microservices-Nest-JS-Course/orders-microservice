import 'dotenv/config';
import * as joi from 'joi';

interface EnvsVars {
  PORT: number;
  NATS_SERVERS: string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
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
  messaging: {
    options: {
      NATS: {
        servers: envVars.NATS_SERVERS,
      },
    },
  },
};
