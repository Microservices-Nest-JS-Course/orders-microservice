import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  imports: [MessagingModule.register()],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
