import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity({ name: 'customer_profile' })
export class CustomerProfile {
  @PrimaryColumn({ name: 'accountid' })
  accountId!: number;

  @OneToOne(() => UserAccount, (account) => account.customerProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountid' })
  account!: UserAccount;

  @Column({ name: 'fullname', length: 255 })
  fullName!: string;

  @Column({ name: 'displayname', length: 255, nullable: true })
  displayName?: string;

  @Column({ name: 'gender', length: 20, nullable: true })
  gender?: string;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob?: string;

  @Column({ name: 'nationality', length: 100, nullable: true })
  nationality?: string;

  @Column({ name: 'purpose', length: 255, nullable: true })
  purpose?: string;

  @Column({ name: 'avatarurl', type: 'text', nullable: true })
  avatarUrl?: string;
}
