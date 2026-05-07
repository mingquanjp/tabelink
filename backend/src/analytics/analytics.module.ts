import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
