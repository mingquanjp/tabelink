import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export enum RestaurantTableStatus {
  Empty = 'Empty',
  Using = 'Using',
  Reserved = 'Reserved',
}

@Entity({ name: 'restaurant_table' })
export class RestaurantTable {
  @PrimaryGeneratedColumn({ name: 'tableid' })
  tableId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'tablename', length: 100 })
  tableName!: string;

  @Column({ name: 'capacity' })
  capacity!: number;

  @Column({
    name: 'status',
    length: 50,
    default: RestaurantTableStatus.Empty,
  })
  status!: RestaurantTableStatus;

  @Column({ name: 'positionx', type: 'decimal', precision: 8, scale: 2, nullable: true })
  positionX?: string | null;

  @Column({ name: 'positiony', type: 'decimal', precision: 8, scale: 2, nullable: true })
  positionY?: string | null;

  @Column({ name: 'width', type: 'decimal', precision: 8, scale: 2, nullable: true })
  width?: string | null;

  @Column({ name: 'height', type: 'decimal', precision: 8, scale: 2, nullable: true })
  height?: string | null;

  @Column({ name: 'zone', type: 'varchar', length: 100, nullable: true })
  zone?: string | null;

  @OneToMany(() => Reservation, (reservation) => reservation.table)
  reservations?: Reservation[];
}
