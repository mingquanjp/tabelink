import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FeatureMaster } from './feature-master.entity';
import { Restaurant } from './restaurant.entity';

@Entity({ name: 'restaurant_feature' })
export class RestaurantFeature {
  @PrimaryColumn({ name: 'restaurantid' })
  restaurantId!: number;

  @PrimaryColumn({ name: 'featureid' })
  featureId!: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.featureLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @ManyToOne(() => FeatureMaster, (feature) => feature.restaurantLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'featureid' })
  feature!: FeatureMaster;
}
