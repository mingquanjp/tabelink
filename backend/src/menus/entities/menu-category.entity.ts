import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity({ name: 'menu_category' })
export class MenuCategory {
  @PrimaryGeneratedColumn({ name: 'categoryid' })
  categoryId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'categorycode', length: 100 })
  categoryCode!: string;

  @Column({ name: 'categorynamevn', length: 255 })
  categoryNameVn!: string;

  @Column({ name: 'categorynamejp', length: 255 })
  categoryNameJp!: string;

  @Column({ name: 'sortorder', default: 0 })
  sortOrder!: number;

  @Column({ name: 'isactive', default: true })
  isActive!: boolean;
}
