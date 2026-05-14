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
import { MenuItemCriterion } from './menu-item-criterion.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity({ name: 'menu_item' })
export class MenuItem {
  @PrimaryGeneratedColumn({ name: 'itemid' })
  itemId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'categoryid', type: 'int', nullable: true })
  categoryId?: number | null;

  @Column({ name: 'namevn', length: 255 })
  nameVn!: string;

  @Column({ name: 'namejp', length: 255 })
  nameJp!: string;

  @Column({ name: 'price', type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ name: 'descriptionvn', type: 'text', nullable: true })
  descriptionVn?: string;

  @Column({ name: 'descriptionjp', type: 'text', nullable: true })
  descriptionJp?: string;

  @Column({ name: 'ingredients', type: 'text', nullable: true })
  ingredients?: string;

  @Column({ name: 'isrecommendedforjp', default: false })
  isRecommendedForJp!: boolean;

  @Column({ name: 'imageurl', type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ name: 'imagepublicid', type: 'text', nullable: true })
  imagePublicId?: string | null;

  @Column({ name: 'isactive', default: true })
  isActive!: boolean;

  @Column({ name: 'deletedat', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => MenuItemCriterion, (criterion) => criterion.item)
  criteria?: MenuItemCriterion[];
}
