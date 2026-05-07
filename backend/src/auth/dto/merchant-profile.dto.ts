import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MerchantProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Sakura Sushi' })
  storeName!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: 'Sakura Sushi JP' })
  storeNameJp?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1-2-3 Shibuya, Tokyo' })
  address!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Tanaka Ken' })
  representativeName!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '+81-90-1234-5678' })
  phone!: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false, example: '10:00-22:00' })
  openingHours?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({ required: false, example: false })
  issuesVat?: boolean;
}
