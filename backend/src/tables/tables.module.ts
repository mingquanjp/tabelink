import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationSpecialRequest } from './entities/reservation-special-request.entity';
import { RestaurantTable } from './entities/restaurant-table.entity';
import { SpecialRequestTemplate } from './entities/special-request-template.entity';
import { CustomerProfile } from '../auth/entities/customer-profile.entity';
import { MailModule } from '../mail/mail.module';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { UserReservationsController } from './user-reservations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerProfile,
      Restaurant,
      RestaurantTable,
      Reservation,
      ReservationSpecialRequest,
      SpecialRequestTemplate,
    ]),
    MailModule,
  ],
  controllers: [TablesController, UserReservationsController],
  providers: [TablesService],
})
export class TablesModule {}
