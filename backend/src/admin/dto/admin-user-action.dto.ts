import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AdminUserActionDto {
  @ApiProperty({ example: 'Violation of platform policy.' })
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
