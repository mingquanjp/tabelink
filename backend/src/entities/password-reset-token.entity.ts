import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from './user-account.entity';

@Entity({ name: 'password_reset_token' })
export class PasswordResetToken {
  @PrimaryGeneratedColumn({ name: 'tokenid' })
  tokenId!: number;

  @Column({ name: 'accountid' })
  accountId!: number;

  @ManyToOne(() => UserAccount, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountid' })
  account!: UserAccount;

  @Column({ name: 'tokenhash', type: 'text' })
  tokenHash!: string;

  @Column({ name: 'expiresat', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'usedat', type: 'timestamptz', nullable: true })
  usedAt?: Date | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;
}
