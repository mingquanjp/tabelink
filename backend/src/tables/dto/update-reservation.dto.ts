import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ReservationStatus } from '../../entities/reservation.entity';

export class UpdateReservationDto {
  @ApiPropertyOptional({
    enum: ReservationStatus,
    example: ReservationStatus.Approved,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @ApiPropertyOptional({
    example: 3,
    description: 'Assigns the reservation to an existing table in the same restaurant.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  tableId?: number;

  @ApiPropertyOptional({ example: 'Customer requested a window seat.' })
  @IsOptional()
  @IsString()
  note?: string;
}
