import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum RestaurantSocialProvider {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Website = 'Website',
  Line = 'Line',
  Other = 'Other',
}

@Entity({ name: 'restaurant_social_link' })
export class RestaurantSocialLink {
  @PrimaryGeneratedColumn({ name: 'sociallinkid' })
  socialLinkId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'provider', length: 50 })
  provider!: RestaurantSocialProvider;

  @Column({ name: 'url', type: 'text' })
  url!: string;

  @Column({
    name: 'displaylabel',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayLabel?: string | null;

  @Column({ name: 'sortorder', default: 0 })
  sortOrder!: number;

  @Column({ name: 'isactive', default: true })
  isActive!: boolean;
}
