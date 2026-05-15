import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class GetRestaurantRouteQueryDto {
  @ApiProperty({
    example: 21.0166,
    description: 'Current user latitude from browser GPS.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat!: number;

  @ApiProperty({
    example: 105.8412,
    description: 'Current user longitude from browser GPS.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng!: number;
}
