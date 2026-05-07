import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  Matches,
} from 'class-validator';

export class MenuItemCriterionDto {
  @ApiProperty({ example: 'Mùi hương', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(/^[\p{L}\p{N}\p{M}\sー々ぁ-んァ-ン一-龯]+$/u, {
    message: 'criterionName must not contain special characters or line breaks.',
  })
  criterionName!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  ratingLevel!: number;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Pho bo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVn!: string;

  @ApiProperty({ example: '牛肉フォー' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameJp!: string;

  @ApiProperty({ example: 85000, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'Pho bo voi nuoc dung thanh.' })
  @IsOptional()
  @IsString()
  descriptionVn?: string;

  @ApiPropertyOptional({ example: 'あっさりした牛肉フォーです。' })
  @IsOptional()
  @IsString()
  descriptionJp?: string;

  @ApiPropertyOptional({ example: 'Rice noodles, beef, onion, herbs' })
  @IsOptional()
  @IsString()
  ingredients?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isRecommendedForJp?: boolean;

  @ApiPropertyOptional({ example: 1, minimum: 0, maximum: 5, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  spicyLevel?: number;

  @ApiPropertyOptional({ example: 2, minimum: 0, maximum: 5, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  corianderLevel?: number;

  @ApiPropertyOptional({
    type: [MenuItemCriterionDto],
    example: [
      { criterionName: 'Mùi hương', ratingLevel: 4 },
      { criterionName: 'Độ chua', ratingLevel: 2 },
    ],
  })
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MenuItemCriterionDto)
  criteria?: MenuItemCriterionDto[];

  @ApiPropertyOptional({ example: 'https://example.com/menu/pho-bo.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'tabelink/restaurants/1/menus/pho-bo',
    description: 'Cloudinary public_id returned by the menu image upload API.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagePublicId?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
