import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'badge_master' })
export class BadgeMaster {
  @PrimaryGeneratedColumn({ name: 'badgeid' })
  badgeId!: number;

  @Column({ name: 'badgecode', length: 100 })
  badgeCode!: string;

  @Column({ name: 'badgenamevn', length: 255 })
  badgeNameVn!: string;

  @Column({ name: 'badgenamejp', length: 255 })
  badgeNameJp!: string;

  @Column({ name: 'descriptionvn', type: 'text', nullable: true })
  descriptionVn?: string;

  @Column({ name: 'descriptionjp', type: 'text', nullable: true })
  descriptionJp?: string;

  @Column({ name: 'criteria', type: 'text', nullable: true })
  criteria?: string;
}
