import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { RestaurantBadge } from '../restaurants/entities/restaurant-badge.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { BadgeMaster } from '../verification/entities/badge-master.entity';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, RestaurantBadge, BadgeMaster]),
  ],
  controllers: [MapsController],
  providers: [MapsService],
})
export class MapsModule {}
