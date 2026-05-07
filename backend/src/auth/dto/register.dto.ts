import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
import { REGISTER_ROLES, UserRole } from '../auth.constants';
import type { RegisterRole } from '../auth.constants';

export class RegisterDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'Password123' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Nguyen Van A' })
  fullName!: string;

  @IsIn(REGISTER_ROLES)
  @ApiProperty({ example: 'User', enum: REGISTER_ROLES })
  role!: RegisterRole;

  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false, example: 'Diner' })
  purpose?: string;
}
