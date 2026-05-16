import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BadgeMaster } from '../../verification/entities/badge-master.entity';
import { Restaurant } from './restaurant.entity';

@Entity({ name: 'restaurant_badge' })
export class RestaurantBadge {
  @PrimaryColumn({ name: 'restaurantid' })
  restaurantId!: number;

  @PrimaryColumn({ name: 'badgeid' })
  badgeId!: number;

  @ManyToOne(() => Restaurant, (r) => r.restaurantBadges)
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @ManyToOne(() => BadgeMaster, (bm) => bm.restaurantLinks)
  @JoinColumn({ name: 'badgeid' })
  badge!: BadgeMaster;
}
