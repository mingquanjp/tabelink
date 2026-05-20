import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải từ 8 ký tự trở lên' })
  newPassword!: string;

  @ApiProperty()
  @IsString()
  confirmPassword!: string;
}
