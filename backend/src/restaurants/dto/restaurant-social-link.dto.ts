import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';
import { RestaurantSocialProvider } from '../entities/restaurant-social-link.entity';

export class RestaurantSocialLinkDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  socialLinkId?: number;

  @ApiProperty({ enum: RestaurantSocialProvider, example: RestaurantSocialProvider.Facebook })
  @IsEnum(RestaurantSocialProvider)
  provider!: RestaurantSocialProvider;

  @ApiProperty({ example: 'https://facebook.com/bunchasakura' })
  @IsString()
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ example: 'Bun Cha Sakura Facebook' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayLabel?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
