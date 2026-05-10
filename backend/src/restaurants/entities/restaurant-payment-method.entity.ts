import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PaymentMethod } from './payment-method.entity';
import { Restaurant } from './restaurant.entity';

@Entity({ name: 'restaurant_payment_method' })
export class RestaurantPaymentMethod {
  @PrimaryColumn({ name: 'restaurantid' })
  restaurantId!: number;

  @PrimaryColumn({ name: 'paymentmethodid' })
  paymentMethodId!: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.paymentMethodLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @ManyToOne(() => PaymentMethod, (method) => method.restaurantLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'paymentmethodid' })
  paymentMethod!: PaymentMethod;
}
