import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsOptional()
  @IsIn(['vi', 'ja'])
  @ApiProperty({
    required: false,
    example: 'vi',
    description:
      'Email language: "vi" (Vietnamese) or "ja" (Japanese). Defaults to "vi".',
    enum: ['vi', 'ja'],
  })
  lang?: 'vi' | 'ja';
}
