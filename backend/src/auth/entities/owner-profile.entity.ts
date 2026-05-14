import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity({ name: 'owner_profile' })
export class OwnerProfile {
  @PrimaryColumn({ name: 'accountid' })
  accountId!: number;

  @OneToOne(() => UserAccount, (account) => account.ownerProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountid' })
  account!: UserAccount;

  @Column({ name: 'fullname', length: 255 })
  fullName!: string;

  @Column({ name: 'phone', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'businessname', length: 255, nullable: true })
  businessName?: string;

  @Column({ name: 'avatarurl', type: 'text', nullable: true })
  avatarUrl?: string;
}
