import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../../entities/reservation.entity';

export class ListReservationsQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-08',
    description: 'Filters reservations whose reservation time falls on this UTC date.',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ enum: ReservationStatus })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
