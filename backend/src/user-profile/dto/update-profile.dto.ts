import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileTextDto {
  @ApiProperty({ example: 'Sato Kenji' })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ example: 'Kenji' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiProperty({ example: '男性', enum: ['男性', '女性', 'その他'] })
  @IsOptional()
  @IsEnum(['男性', '女性', 'その他'])
  gender?: string;

  @ApiProperty({ example: 'Japan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @ApiProperty({ example: 'I love Hanoi food...' })
  @IsOptional()
  @IsString()
  purpose?: string;
}
