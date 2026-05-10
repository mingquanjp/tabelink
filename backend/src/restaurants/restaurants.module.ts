import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureMaster } from '../entities/feature-master.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { RestaurantFeature } from '../entities/restaurant-feature.entity';
import { RestaurantMedia } from '../entities/restaurant-media.entity';
import { RestaurantPaymentMethod } from '../entities/restaurant-payment-method.entity';
import { MenuCategory } from '../entities/menu-category.entity';
import { RestaurantSocialLink } from '../entities/restaurant-social-link.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { PublicRestaurantsController } from './public-restaurants.controller';
import { RestaurantImagesService } from './restaurant-images.service';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      RestaurantMedia,
      RestaurantSocialLink,
      MenuCategory,
      FeatureMaster,
      RestaurantFeature,
      PaymentMethod,
      RestaurantPaymentMethod,
    ]),
  ],
  controllers: [RestaurantsController, PublicRestaurantsController],
  providers: [RestaurantsService, RestaurantImagesService],
})
export class RestaurantsModule {}
