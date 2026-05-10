import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RestaurantFeature } from './restaurant-feature.entity';

@Entity({ name: 'feature_master' })
export class FeatureMaster {
  @PrimaryGeneratedColumn({ name: 'featureid' })
  featureId!: number;

  @Column({ name: 'featurecode', length: 100, unique: true })
  featureCode!: string;

  @Column({ name: 'featurenamevn', length: 255 })
  featureNameVn!: string;

  @Column({ name: 'featurenamejp', length: 255 })
  featureNameJp!: string;

  @OneToMany(() => RestaurantFeature, (feature) => feature.feature)
  restaurantLinks?: RestaurantFeature[];
}
