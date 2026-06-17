import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class SearchRestaurantDto {
  @ApiPropertyOptional({ description: 'Search keyword for name and address' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Latitude of current location' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude of current location' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({ description: 'Radius in meters', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number;

  @ApiPropertyOptional({
    description:
      'Array of Feature IDs for Japanese standards (or specific constant like -1 for average rating >= 4.0)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [parseInt(value, 10)];
    if (Array.isArray(value)) return value.map((v) => parseInt(v, 10));
    return value;
  })
  @IsNumber({}, { each: true })
  japaneseStandards?: number[];

  @ApiPropertyOptional({
    description: 'Array of Category IDs for dish types',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [parseInt(value, 10)];
    if (Array.isArray(value)) return value.map((v) => parseInt(v, 10));
    return value;
  })
  @IsNumber({}, { each: true })
  dishTypes?: number[];

  @ApiPropertyOptional({
    description: 'Array of Feature IDs for services/facilities',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [parseInt(value, 10)];
    if (Array.isArray(value)) return value.map((v) => parseInt(v, 10));
    return value;
  })
  @IsNumber({}, { each: true })
  services?: number[];

  @ApiPropertyOptional({ description: 'Filter by VAT issuance support' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  issuesVAT?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
