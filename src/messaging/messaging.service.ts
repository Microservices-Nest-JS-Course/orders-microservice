import {
  HttpStatus,
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom } from 'rxjs';
import { MESSAGING_SERVICE } from 'src/config';

@Injectable()
export class MessagingService implements OnModuleDestroy {
  constructor(
    @Inject(MESSAGING_SERVICE) private readonly client: ClientProxy,
  ) {}
  async send<T>(pattern: string | { cmd: string }, data: any): Promise<T> {
    return lastValueFrom(
      this.client.send<T>(pattern, data).pipe(
        catchError((error) => {
          if (error instanceof RpcException) {
            throw error;
          }
          const err = error as { message?: string; status?: number };
          throw new RpcException({
            message: err?.message || 'Unknown RPC Error',
            status: err?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          });
        }),
      ),
    );
  }

  emit<T>(pattern: string, data: any): void {
    this.client.emit<T>(pattern, data);
  }

  onModuleDestroy() {
    this.client.close();
  }
}
