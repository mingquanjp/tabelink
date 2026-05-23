import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerProfile } from '../auth/entities/customer-profile.entity';
import { OwnerProfile } from '../auth/entities/owner-profile.entity';
import { UserAccount } from '../auth/entities/user-account.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminActionLog } from './entities/admin-action-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAccount,
      CustomerProfile,
      OwnerProfile,
      AdminActionLog,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
