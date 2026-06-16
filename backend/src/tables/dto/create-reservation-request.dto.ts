import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export enum ReservationRequestType {
  Coriander = 'Coriander',
  LessSpicy = 'LessSpicy',
  VATInvoice = 'VATInvoice',
  PrivateRoom = 'PrivateRoom',
  Other = 'Other',
}

export class CreateReservationRequestDto {
  @ApiProperty({
    example: 'Tanaka Taro',
    maxLength: 255,
    description: 'Contact name shown to the restaurant owner.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[\p{L}\p{M}\s.'-]+$/u, {
    message: 'customerName must not contain unsupported special characters.',
  })
  customerName!: string;

  @ApiProperty({
    example: '090-1234-5678',
    maxLength: 50,
    description: 'Half-width phone number for reservation contact.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^\+?[0-9][0-9\s-]{6,48}[0-9]$/, {
    message: 'phoneNumber must be a valid half-width phone number.',
  })
  phoneNumber!: string;

  @ApiProperty({
    example: '2026-05-20',
    description: 'Reservation date selected on screen ID6.',
  })
  @IsDateString({ strict: true })
  reservationDate!: string;

  @ApiProperty({
    example: '19:00',
    description: 'Reservation time selected on screen ID6, 24-hour HH:mm.',
  })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'reservationTime must be HH:mm.',
  })
  reservationTime!: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 99 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  pax!: number;

  @ApiPropertyOptional({
    example: 120,
    default: 120,
    minimum: 1,
    description: 'Reservation duration in minutes.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    enum: ReservationRequestType,
    isArray: true,
    example: [
      ReservationRequestType.Coriander,
      ReservationRequestType.LessSpicy,
      ReservationRequestType.VATInvoice,
    ],
    description:
      'Special request selections from screen ID6. This is the preferred input. Labels/descriptions are resolved from SPECIAL_REQUEST_TEMPLATE in Japanese. PrivateRoom is stored as custom text because the current DB master enum does not include it.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(ReservationRequestType, { each: true })
  requestTypes?: ReservationRequestType[];

  @ApiPropertyOptional({
    example: 'Window seat if available.',
    description: 'Free-form request from the "other request" textarea.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customRequest?: string;
}

export class ReservationSpecialRequestResponseDto {
  @ApiProperty({ example: 1 })
  requestId!: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  templateId!: number | null;

  @ApiPropertyOptional({
    enum: ReservationRequestType,
    example: ReservationRequestType.Coriander,
    nullable: true,
  })
  requestType!: ReservationRequestType | null;

  @ApiPropertyOptional({
    example: 'パクチー抜き',
    nullable: true,
    description:
      'Japanese template title stored in SPECIAL_REQUEST_TEMPLATE.TextJP.',
  })
  textJp!: string | null;

  @ApiPropertyOptional({
    example: 'すべての料理からパクチー（コリアンダー）を除きます。',
    nullable: true,
    description:
      'Japanese template description stored in SPECIAL_REQUEST_TEMPLATE.DescriptionJP.',
  })
  descriptionJp!: string | null;

  @ApiPropertyOptional({
    example: 'Window seat if available.',
    nullable: true,
    description:
      'Free-form custom request. Null when the item comes from a template.',
  })
  customText!: string | null;

  @ApiProperty({
    example: 'パクチー抜き',
    description:
      'Display label for the user/owner UI. Uses Japanese text when template-based.',
  })
  label!: string;

  @ApiPropertyOptional({
    example: 'すべての料理からパクチー（コリアンダー）を除きます。',
    nullable: true,
    description: 'Display description for the user/owner UI. Japanese only.',
  })
  description!: string | null;
}

export class CreatedReservationResponseDto {
  @ApiProperty({ example: 100 })
  reservationId!: number;

  @ApiProperty({ example: 1 })
  restaurantId!: number;

  @ApiProperty({ example: '2026-05-20T12:00:00.000Z' })
  reservationDateTime!: Date;

  @ApiProperty({ example: 120 })
  durationMinutes!: number;

  @ApiProperty({ example: '2026-05-20T14:00:00.000Z' })
  reservationEndDateTime!: Date;

  @ApiProperty({ example: 2 })
  pax!: number;

  @ApiProperty({ example: 'Tanaka Taro' })
  customerName!: string;

  @ApiProperty({ example: '090-1234-5678' })
  phoneNumber!: string;

  @ApiPropertyOptional({
    example: 'Window seat if available.',
    nullable: true,
  })
  note!: string | null;

  @ApiProperty({
    type: [ReservationSpecialRequestResponseDto],
  })
  specialRequests!: ReservationSpecialRequestResponseDto[];

  @ApiProperty({ enum: ReservationStatus, example: ReservationStatus.Pending })
  status!: ReservationStatus;
}

export class OwnerNotificationResponseDto {
  @ApiProperty({ example: true })
  sent!: boolean;

  @ApiPropertyOptional({
    example: 'Owner notification failed.',
    description: 'Present only when the owner email notification was not sent.',
  })
  reason?: string;
}

export class CreateReservationRequestResponseDto {
  @ApiProperty({ example: 'Reservation request submitted successfully.' })
  message!: string;

  @ApiProperty({ type: OwnerNotificationResponseDto })
  ownerNotification!: OwnerNotificationResponseDto;

  @ApiProperty({ type: CreatedReservationResponseDto })
  reservation!: CreatedReservationResponseDto;
}
