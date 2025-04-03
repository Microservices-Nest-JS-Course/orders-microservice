import { DynamicModule, Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { envs, MESSAGING_SERVICE, NAST_TRANSPORT } from 'src/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [],
})
export class MessagingModule {
  static register(): DynamicModule {
    const transport = NAST_TRANSPORT;
    const options = envs.messaging.options[transport];
    return {
      module: MessagingModule,
      imports: [
        ClientsModule.register([
          {
            name: MESSAGING_SERVICE,
            transport: Transport.NATS,
            options,
          },
        ]),
      ],
      providers: [MessagingService],
      exports: [MessagingService],
    };
  }
}
