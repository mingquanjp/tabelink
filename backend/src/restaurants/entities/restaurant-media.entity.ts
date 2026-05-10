import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum RestaurantMediaType {
  Photo = 'Photo',
  Cover = 'Cover',
  Other = 'Other',
}

export enum RestaurantMediaStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

@Entity({ name: 'restaurant_media' })
export class RestaurantMedia {
  @PrimaryGeneratedColumn({ name: 'mediaid' })
  mediaId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'mediaurl', type: 'text' })
  mediaUrl!: string;

  @Column({ name: 'mediatype', length: 50 })
  mediaType!: RestaurantMediaType;

  @Column({ name: 'sortorder', default: 0 })
  sortOrder!: number;

  @Column({ name: 'status', length: 50, default: RestaurantMediaStatus.Pending })
  status!: RestaurantMediaStatus;
}
