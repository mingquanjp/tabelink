import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAccount } from '../../auth/entities/user-account.entity';

export enum AdminActionType {
  UpdateUser = 'UpdateUser',
  ChangeRole = 'ChangeRole',
  Ban = 'Ban',
  Restore = 'Restore',
  SoftDelete = 'SoftDelete',
}

@Entity({ name: 'admin_action_log' })
export class AdminActionLog {
  @PrimaryGeneratedColumn({ name: 'logid' })
  logId!: number;

  @Column({ name: 'adminaccountid' })
  adminAccountId!: number;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'adminaccountid' })
  admin?: UserAccount;

  @Column({ name: 'targetaccountid' })
  targetAccountId!: number;

  @ManyToOne(() => UserAccount)
  @JoinColumn({ name: 'targetaccountid' })
  target?: UserAccount;

  @Column({ name: 'actiontype', length: 50 })
  actionType!: AdminActionType;

  @Column({ name: 'actioncontent', type: 'text' })
  actionContent!: string;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason?: string | null;

  @CreateDateColumn({ name: 'createdat', type: 'timestamptz' })
  createdAt!: Date;
}
