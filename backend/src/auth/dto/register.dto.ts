import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
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
  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full Name (Diner) or Representative Name (Merchant)',
  })
  fullName!: string;

  @IsIn(REGISTER_ROLES)
  @ApiProperty({
    example: UserRole.User,
    enum: [UserRole.User, UserRole.Owner],
    description: 'Chọn vai trò: User (Thực khách) hoặc Owner (Chủ nhà hàng)',
  })
  role!: RegisterRole;

  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: false,
    example: 'Diner',
    description: 'Purpose of using the app',
  })
  purpose?: string;

  // --- Diner Profile Fields (Lựa chọn A) ---
  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Foodie',
    description: 'Biệt danh hoặc tên hiển thị (ユーザー名)',
  })
  displayName?: string;

  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '12/31/1990',
    description: 'Ngày tháng năm sinh (生年月日) - MM/DD/YYYY',
  })
  dob?: string;

  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Female',
    description: 'Giới tính (性別): Nam, Nữ, Khác',
  })
  gender?: string;

  @ValidateIf((value) => value.role === UserRole.User)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Japan',
    description: 'Quốc tịch (国籍): Nhật Bản hoặc Khác',
  })
  nationality?: string;

  // --- Merchant Profile Fields (Lựa chọn B) ---
  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Sakura Sushi',
    description: 'Tên cửa hàng (店舗名)',
  })
  storeName?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Sakura Sushi JP',
    description: 'Tên cửa hàng tiếng Nhật',
  })
  storeNameJp?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '1-2-3 Shibuya, Tokyo',
    description: 'Địa chỉ cửa hàng (住所)',
  })
  address?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 'Tanaka Ken',
    description: 'Tên người đại diện (代表者名) - Optional if same as fullName',
  })
  representativeName?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '+81-90-1234-5678',
    description: 'Số điện thoại cửa hàng (電話番号)',
  })
  phone?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '10:00-22:00',
    description: 'Giờ mở cửa',
  })
  openingHours?: string;

  @ValidateIf((value) => value.role === UserRole.Owner)
  @IsOptional()
  @ApiProperty({
    required: false,
    example: false,
    description: 'Có xuất hóa đơn VAT không?',
  })
  issuesVat?: boolean;
}
