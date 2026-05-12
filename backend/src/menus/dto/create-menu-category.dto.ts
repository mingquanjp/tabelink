import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({ example: 'メイン料理', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  categoryNameJp!: string;

  @ApiPropertyOptional({ example: 'Món chính', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  categoryNameVn?: string;

  @ApiPropertyOptional({
    example: 'main',
    maxLength: 100,
    description: 'Optional stable category code. Generated when omitted.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoryCode?: string;
}
