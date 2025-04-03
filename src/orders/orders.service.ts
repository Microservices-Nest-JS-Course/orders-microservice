import { Injectable, OnModuleInit, Logger, HttpStatus } from '@nestjs/common';
import { CreateOrderDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { MessagingService } from 'src/messaging/messaging.service';
import { ProductResponse } from './interfaces/product-response.interface';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(private readonly client: MessagingService) {
    super();
  }
  private readonly Logger = new Logger(OrdersService.name);
  async onModuleInit() {
    await this.$connect();
  }

  async create(createOrderDto: CreateOrderDto) {
    const productsIds = createOrderDto.items.map((item) => item.productId);
    // Como es observable: firstValueFrom para volverlo promesa
    const products: ProductResponse[] = await this.client.send(
      { cmd: 'validate-products' },
      productsIds,
    );
    // 2. calculo de los valores
    const totalAmount: number = createOrderDto.items.reduce(
      (acc, orderItem) => {
        const product = products.find(
          (product) => +product.id === orderItem.productId,
        );
        const price = product?.price ?? 0;
        return acc + price * orderItem.quantity;
      },
      0,
    );

    const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
      return acc + orderItem.quantity;
    }, 0);

    // 3. crear una transaccion de DB
    const order = await this.order.create({
      data: {
        totalAmount,
        totalItems,
        OrderItem: {
          createMany: {
            data: createOrderDto.items.map((orderItem) => ({
              price:
                products?.find((product) => +product.id === orderItem.productId)
                  ?.price ?? 0,
              productId: orderItem.productId,
              quantity: orderItem.quantity,
            })),
          },
        },
      },
      include: {
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name:
          products.find((product) => +product.id === orderItem.productId)
            ?.name || 'Nombre no disponible',
      })),
    };
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page = 1, limit = 10, status } = orderPaginationDto;
    const totalPages = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(totalPages / limit);
    return {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { status },
      }),
      meta: {
        page,
        totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id,
      },
      include: {
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
    if (!order)
      throw new RpcException({
        message: `Order with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    const productsIds = order.OrderItem.map((orderItem) => orderItem.productId);

    const products: ProductResponse[] = await this.client.send(
      { cmd: 'validate-products' },
      productsIds,
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name:
          products.find((product) => +product.id === orderItem.productId)
            ?.name || 'Nombre no disponible',
      })),
    };
  }

  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;
    const order = await this.findOne(id);
    if (order.status === status) return order;
    return this.order.update({
      where: { id },
      data: { status },
    });
  }
}
