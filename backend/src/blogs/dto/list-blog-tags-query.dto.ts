import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListBlogTagsQueryDto {
  @ApiPropertyOptional({ example: 'hanoi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;
}
