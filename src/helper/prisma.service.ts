import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PermissionMiddleware } from 'src/middlewares/prisma/role.middleware';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  constructor() {
    super();
    this.$use(PermissionMiddleware());
  }
  
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}