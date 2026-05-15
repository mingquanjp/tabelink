import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum SpecialRequestType {
  Coriander = 'Coriander',
  LessSpicy = 'LessSpicy',
  VATInvoice = 'VATInvoice',
  Other = 'Other',
}

@Entity({ name: 'special_request_template' })
export class SpecialRequestTemplate {
  @PrimaryGeneratedColumn({ name: 'templateid' })
  templateId!: number;

  @Column({ name: 'textvn', type: 'text' })
  textVn!: string;

  @Column({ name: 'textjp', type: 'text' })
  textJp!: string;

  @Column({ name: 'requesttype', length: 50 })
  requestType!: SpecialRequestType;
}
