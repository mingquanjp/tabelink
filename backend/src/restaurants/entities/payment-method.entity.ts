import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RestaurantPaymentMethod } from './restaurant-payment-method.entity';

@Entity({ name: 'payment_method' })
export class PaymentMethod {
  @PrimaryGeneratedColumn({ name: 'paymentmethodid' })
  paymentMethodId!: number;

  @Column({ name: 'methodcode', length: 100, unique: true })
  methodCode!: string;

  @Column({ name: 'methodname', length: 255 })
  methodName!: string;

  @OneToMany(() => RestaurantPaymentMethod, (method) => method.paymentMethod)
  restaurantLinks?: RestaurantPaymentMethod[];
}
