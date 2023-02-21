import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { HelperModule } from 'src/helper/helper.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HelperModule, DatabaseModule],
  controllers: [AuthController]
})
export class AuthModule {}
