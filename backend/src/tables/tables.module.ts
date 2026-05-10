import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { RestaurantTable } from './entities/restaurant-table.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, RestaurantTable, Reservation])],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
