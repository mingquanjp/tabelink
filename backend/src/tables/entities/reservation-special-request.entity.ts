import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { SpecialRequestTemplate } from './special-request-template.entity';

@Entity({ name: 'reservation_special_request' })
export class ReservationSpecialRequest {
  @PrimaryGeneratedColumn({ name: 'requestid' })
  requestId!: number;

  @Column({ name: 'reservationid' })
  reservationId!: number;

  @ManyToOne(() => Reservation, (reservation) => reservation.specialRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservationid' })
  reservation!: Reservation;

  @Column({ name: 'templateid', type: 'int', nullable: true })
  templateId?: number | null;

  @ManyToOne(() => SpecialRequestTemplate, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'templateid' })
  template?: SpecialRequestTemplate | null;

  @Column({ name: 'customtext', type: 'text', nullable: true })
  customText?: string | null;
}
