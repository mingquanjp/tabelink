import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'refresh.jwt.token',
    description:
      'Optional when refreshToken is available in the HttpOnly cookie.',
  })
  refreshToken?: string;
}
