import { Module } from '@nestjs/common';
import { HelperModule } from './helper/helper.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './routes/auth/auth.module';
import { UserModule } from './routes/user/user.module';
import { RoleModule } from './routes/role/role.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permissions.guard';

@Module({
  imports: [HelperModule, DatabaseModule, AuthModule, UserModule, RoleModule],
  providers: [
        {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }, 
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ]
})
export class AppModule {}
