import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class RecordRestaurantViewDto {
  @ApiPropertyOptional({
    description: 'Set true when the visitor is identified as Japanese.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isJapaneseVisitor?: boolean;
}
