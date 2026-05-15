import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { BlogMediaDto } from './blog-media.dto';

export class CreateBlogDto {
  @ApiPropertyOptional({ example: 'Một bữa tối ở Hà Nội' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    example: 'Quán có không khí dễ chịu, món ăn hợp khẩu vị và phục vụ tốt.',
  })
  @IsString()
  @MaxLength(10000)
  content!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  tasteRating!: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  hygieneRating!: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  serviceRating!: number;

  @ApiPropertyOptional({
    type: [BlogMediaDto],
    description: 'Photo/video metadata returned by blog media upload endpoint.',
  })
  @IsOptional()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => BlogMediaDto)
  media?: BlogMediaDto[];

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Existing hashtag IDs selected or created before publishing.',
  })
  @IsOptional()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];
}
