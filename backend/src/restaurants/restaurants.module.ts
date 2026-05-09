import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureMaster } from '../entities/feature-master.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { RestaurantFeature } from '../entities/restaurant-feature.entity';
import { RestaurantMedia } from '../entities/restaurant-media.entity';
import { RestaurantPaymentMethod } from '../entities/restaurant-payment-method.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantMedia,
      FeatureMaster,
      RestaurantFeature,
      PaymentMethod,
      RestaurantPaymentMethod,
    ]),
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
