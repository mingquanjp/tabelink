import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountStatus, UserRole } from '../auth.constants';
import { CustomerProfile } from './customer-profile.entity';
import { OwnerProfile } from './owner-profile.entity';

@Entity({ name: 'user_account' })
export class UserAccount {
  @PrimaryGeneratedColumn({ name: 'accountid' })
  accountId!: number;

  @Column({ name: 'email', length: 255 })
  email!: string;

  @Column({ name: 'passwordhash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'role', length: 50 })
  role!: UserRole;

  @Column({ name: 'status', length: 50, default: AccountStatus.Active })
  status!: AccountStatus;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedat', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => CustomerProfile, (profile) => profile.account)
  customerProfile?: CustomerProfile;

  @OneToOne(() => OwnerProfile, (profile) => profile.account)
  ownerProfile?: OwnerProfile;
}
