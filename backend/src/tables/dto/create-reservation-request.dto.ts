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
      'Template-style special requests from screen ID6. PrivateRoom is stored as custom text because the current DB master enum does not include it.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(ReservationRequestType, { each: true })
  requestTypes?: ReservationRequestType[];

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description:
      'Optional direct SPECIAL_REQUEST_TEMPLATE.TemplateID values. requestTypes is preferred for screen ID6.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  templateIds?: number[];

  @ApiPropertyOptional({
    example: 'Window seat if available.',
    description: 'Free-form request from the "other request" textarea.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customRequest?: string;
}
