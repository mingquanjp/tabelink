import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchRestaurantOptionsQueryDto {
  @ApiPropertyOptional({
    example: 'Pizza 4P',
    description:
      'Keyword for ID7 restaurant autocomplete. Searches Vietnamese and Japanese restaurant names.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;
}
