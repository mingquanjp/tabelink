import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BadgeMaster } from './badge-master.entity';
import { Restaurant } from './restaurant.entity';
import { UserAccount } from './user-account.entity';

export enum BadgeApplicationStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

@Entity({ name: 'badge_application' })
export class BadgeApplication {
  @PrimaryGeneratedColumn({ name: 'appid' })
  appId!: number;

  @Column({ name: 'restaurantid' })
  restaurantId!: number;

  @ManyToOne(() => Restaurant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantid' })
  restaurant!: Restaurant;

  @Column({ name: 'badgeid' })
  badgeId!: number;

  @ManyToOne(() => BadgeMaster)
  @JoinColumn({ name: 'badgeid' })
  badge?: BadgeMaster;

  @Column({ name: 'submittedbyowneraccountid' })
  submittedByOwnerAccountId!: number;

  @Column({ name: 'reviewedbyadminid', nullable: true })
  reviewedByAdminId?: number;

  @ManyToOne(() => UserAccount, {
    nullable: true,
  })
  @JoinColumn({ name: 'reviewedbyadminid' })
  reviewedByAdmin?: UserAccount;

  @Column({ name: 'businesslicenseurl', type: 'text', nullable: true })
  businessLicenseUrl?: string;

  @Column({ name: 'businesslicensepublicid', type: 'text', nullable: true })
  businessLicensePublicId?: string;

  @Column({ name: 'foodsafetycerturl', type: 'text', nullable: true })
  foodSafetyCertUrl?: string;

  @Column({ name: 'foodsafetycertpublicid', type: 'text', nullable: true })
  foodSafetyCertPublicId?: string;

  @Column({
    name: 'status',
    length: 50,
    default: BadgeApplicationStatus.Pending,
  })
  status!: BadgeApplicationStatus;

  @Column({ name: 'submittedat', type: 'timestamptz' })
  submittedAt!: Date;

  @Column({ name: 'reviewedat', type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'reviewnote', type: 'text', nullable: true })
  reviewNote?: string;
}
