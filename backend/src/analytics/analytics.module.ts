import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '../menus/entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { AnalyticsTrackingController } from './analytics-tracking.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, MenuItem])],
  controllers: [AnalyticsController, AnalyticsTrackingController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
