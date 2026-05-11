import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RestaurantTableStatus } from '../entities/restaurant-table.entity';

export class UpdateTableStatusDto {
  @ApiProperty({
    enum: RestaurantTableStatus,
    example: RestaurantTableStatus.Using,
  })
  @IsEnum(RestaurantTableStatus)
  status!: RestaurantTableStatus;
}
