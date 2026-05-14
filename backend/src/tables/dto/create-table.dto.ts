import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RestaurantTableStatus } from '../entities/restaurant-table.entity';

export class CreateTableDto {
  @ApiProperty({ example: 'A1', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  tableName!: string;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({
    enum: RestaurantTableStatus,
    default: RestaurantTableStatus.Empty,
  })
  @IsOptional()
  @IsEnum(RestaurantTableStatus)
  status?: RestaurantTableStatus;

  @ApiPropertyOptional({ example: 120.5 })
  @IsOptional()
  @IsNumber()
  positionX?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  positionY?: number;

  @ApiPropertyOptional({ example: 90, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  width?: number;

  @ApiPropertyOptional({ example: 90, minimum: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  height?: number;

  @ApiPropertyOptional({ example: 'Floor 1', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  zone?: string;
}
