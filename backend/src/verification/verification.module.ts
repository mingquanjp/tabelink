import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgeApplication } from './entities/badge-application.entity';
import { BadgeMaster } from './entities/badge-master.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeApplication, BadgeMaster, Restaurant])],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
