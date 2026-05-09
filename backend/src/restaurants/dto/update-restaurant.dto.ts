import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { RestaurantMediaDto } from './restaurant-media.dto';

export class UpdateRestaurantDto {
  @ApiPropertyOptional({ example: 'Bun Cha Sakura' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVn?: string;

  @ApiPropertyOptional({ example: 'ブンチャーさくら' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameJp?: string;

  @ApiPropertyOptional({ example: '24 Hang Manh, Hoan Kiem, Hanoi' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 21.033781 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: 105.848138 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ example: 'Quán Việt phù hợp khách Nhật, có menu song ngữ.' })
  @IsOptional()
  @IsString()
  descriptionVn?: string;

  @ApiPropertyOptional({ example: '日本人向けのベトナム料理店です。' })
  @IsOptional()
  @IsString()
  descriptionJp?: string;

  @ApiPropertyOptional({ example: '+84 90 123 4567' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '10:00-22:00' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  openingHours?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  issuesVat?: boolean;

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: 'FEATURE_MASTER.FeatureID values selected for this restaurant.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  featureIds?: number[];

  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2],
    description: 'PAYMENT_METHOD.PaymentMethodID values selected for this restaurant.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  paymentMethodIds?: number[];

  @ApiPropertyOptional({ type: [RestaurantMediaDto] })
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RestaurantMediaDto)
  media?: RestaurantMediaDto[];
}
