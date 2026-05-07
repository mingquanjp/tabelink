import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity({ name: 'menu_item_criterion' })
export class MenuItemCriterion {
  @PrimaryGeneratedColumn({ name: 'criterionid' })
  criterionId!: number;

  @Column({ name: 'itemid' })
  itemId!: number;

  @ManyToOne(() => MenuItem, (item) => item.criteria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'itemid' })
  item!: MenuItem;

  @Column({ name: 'criterionname', length: 255 })
  criterionName!: string;

  @Column({ name: 'ratinglevel' })
  ratingLevel!: number;

  @Column({ name: 'sortorder', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;
}
