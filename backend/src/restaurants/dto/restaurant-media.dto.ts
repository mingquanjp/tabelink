import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { RestaurantMediaType } from '../entities/restaurant-media.entity';

export class RestaurantMediaDto {
  @ApiProperty({ example: 'https://example.com/restaurants/cover.jpg' })
  @IsUrl({ require_protocol: true })
  mediaUrl!: string;

  @ApiProperty({ enum: RestaurantMediaType, example: RestaurantMediaType.Cover })
  @IsEnum(RestaurantMediaType)
  mediaType!: RestaurantMediaType;

  @ApiPropertyOptional({ example: 0, minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
