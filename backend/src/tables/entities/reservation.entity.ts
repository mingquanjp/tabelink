import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomerProfile } from '../../auth/entities/customer-profile.entity';
import { RestaurantTable } from './restaurant-table.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Arrived = 'Arrived',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

@Entity({ name: 'reservation' })
export class Reservation {
  @PrimaryGeneratedColumn({ name: 'reservationid' })
  reservationId!: number;

  @Column({ name: 'customeraccountid' })
  customerAccountId!: number;

  @ManyToOne(() => CustomerProfile)
  @JoinColumn({ name: 'customeraccountid' })
  customer!: CustomerProfile;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'tableid', type: 'int', nullable: true })
  tableId?: number | null;

  @ManyToOne(() => RestaurantTable, (table) => table.reservations, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn([
    { name: 'tableid', referencedColumnName: 'tableId' },
    { name: 'restaurantid', referencedColumnName: 'restaurantId' },
  ])
  table?: RestaurantTable | null;

  @Column({ name: 'reservationdatetime', type: 'timestamptz' })
  reservationDateTime!: Date;

  @Column({ name: 'durationminutes', default: 120 })
  durationMinutes!: number;

  @Column({ name: 'pax' })
  pax!: number;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({
    name: 'status',
    length: 50,
    default: ReservationStatus.Pending,
  })
  status!: ReservationStatus;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedAt!: Date;
}
