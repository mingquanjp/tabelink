import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OwnerProfile } from './owner-profile.entity';

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

  @Column({ name: 'phone', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'openinghours', length: 255, nullable: true })
  openingHours?: string;

  @Column({ name: 'issuesvat', default: false })
  issuesVat!: boolean;

  @Column({ name: 'status', length: 50, default: 'Draft' })
  status!: string;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedAt!: Date;
}
