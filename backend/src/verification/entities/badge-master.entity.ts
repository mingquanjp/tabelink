import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RestaurantBadge } from '../../restaurants/entities/restaurant-badge.entity';

@Entity({ name: 'badge_master' })
export class BadgeMaster {
  @PrimaryGeneratedColumn({ name: 'badgeid' })
  badgeId!: number;

  @Column({ name: 'badgecode', length: 100 })
  badgeCode!: string;

  @Column({ name: 'badgenamevn', length: 255 })
  badgeNameVn!: string;

  @Column({ name: 'badgenamejp', length: 255 })
  badgeNameJp!: string;

  @Column({ name: 'descriptionvn', type: 'text', nullable: true })
  descriptionVn?: string;

  @Column({ name: 'descriptionjp', type: 'text', nullable: true })
  descriptionJp?: string;

  @Column({ name: 'criteria', type: 'text', nullable: true })
  criteria?: string;

  @OneToMany(() => RestaurantBadge, (rb) => rb.badge)
  restaurantLinks!: RestaurantBadge[];
}
