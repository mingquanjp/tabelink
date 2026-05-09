import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OwnerProfile } from './owner-profile.entity';
import { RestaurantFeature } from './restaurant-feature.entity';
import { RestaurantMedia } from './restaurant-media.entity';
import { RestaurantPaymentMethod } from './restaurant-payment-method.entity';

@Entity({ name: 'restaurant' })
export class Restaurant {
  @PrimaryGeneratedColumn({ name: 'restaurantid' })
  restaurantId!: number;

  @Column({ name: 'owneraccountid' })
  ownerAccountId!: number;

  @ManyToOne(() => OwnerProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owneraccountid' })
  owner!: OwnerProfile;

  @Column({ name: 'namevn', length: 255 })
  nameVn!: string;

  @Column({ name: 'namejp', length: 255 })
  nameJp!: string;

  @Column({ name: 'address', type: 'text' })
  address!: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: string | null;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: string | null;

  @Column({ name: 'descriptionvn', type: 'text', nullable: true })
  descriptionVn?: string | null;

  @Column({ name: 'descriptionjp', type: 'text', nullable: true })
  descriptionJp?: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ name: 'openinghours', type: 'varchar', length: 255, nullable: true })
  openingHours?: string | null;

  @Column({ name: 'issuesvat', default: false })
  issuesVat!: boolean;

  @Column({ name: 'status', length: 50, default: 'Draft' })
  status!: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => RestaurantMedia, (media) => media.restaurant)
  media?: RestaurantMedia[];

  @OneToMany(() => RestaurantFeature, (feature) => feature.restaurant)
  featureLinks?: RestaurantFeature[];

  @OneToMany(() => RestaurantPaymentMethod, (method) => method.restaurant)
  paymentMethodLinks?: RestaurantPaymentMethod[];
}
