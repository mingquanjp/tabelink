import { Module } from '@nestjs/common';
import {
  UserHomeController,
  UserReviewerController,
} from './user-home.controller';
import { UserHomeService } from './user-home.service';

@Module({
  controllers: [UserHomeController, UserReviewerController],
  providers: [UserHomeService],
})
export class UserHomeModule {}
