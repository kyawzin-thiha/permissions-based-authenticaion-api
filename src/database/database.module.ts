import { Module } from '@nestjs/common';
import { HelperModule } from 'src/helper/helper.module';
import { AccountService } from './account.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';

@Module({
    imports: [HelperModule],
    providers: [AccountService, UserService, RoleService],
    exports: [AccountService, UserService, RoleService],
})
export class DatabaseModule {}
