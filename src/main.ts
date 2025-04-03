import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Orders-MS-Main');
  try {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.NATS,
        options: {
          servers: envs.messaging.options.NATS.servers,
        },
      },
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.listen();
    logger.log(
      `🚀 Gateway is running on: http://localhost:${envs.server.port}`,
    );
  } catch (error) {
    logger.error(`😱 Application is not running: ${error}`);
    process.exit(1);
  }
}
bootstrap();
