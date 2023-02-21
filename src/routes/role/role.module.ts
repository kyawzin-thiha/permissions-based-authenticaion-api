import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { HelperModule } from 'src/helper/helper.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HelperModule, DatabaseModule],
  controllers: [RoleController]
})
export class RoleModule {}
