import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class BlogMediaDto {
  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/blogs/pho.jpg',
  })
  @IsUrl({ require_tld: false })
  mediaUrl!: string;

  @ApiProperty({ example: 'Photo', enum: ['Photo', 'Video'] })
  @IsIn(['Photo', 'Video'])
  mediaType!: 'Photo' | 'Video';

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
