import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRestaurantReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  toiletCleanliness?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  dishCleanliness?: number;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  spaceCleanliness?: number;

  @ApiPropertyOptional({
    example: 'Clean, friendly, and easy to reserve in Japanese.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Marks the review as Japanese-audience feedback for Home review filters.',
  })
  @IsOptional()
  @IsBoolean()
  isJapaneseTag?: boolean;

  @ApiPropertyOptional({
    example: 1001,
    description: 'Optional completed reservation id to attach this review to.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  reservationId?: number;
}
