import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { HelperModule } from 'src/helper/helper.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HelperModule, DatabaseModule],
  controllers: [UserController]
})
export class UserModule {}
