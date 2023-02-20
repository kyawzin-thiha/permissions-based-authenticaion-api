import { Module } from '@nestjs/common';
import { HelperModule } from './helper/helper.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [HelperModule, DatabaseModule],
})
export class AppModule {}
