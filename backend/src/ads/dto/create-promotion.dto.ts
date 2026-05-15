import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export enum PromotionType {
  Campaign = 'Campaign',
  Advertisement = 'Advertisement',
}

export class CreatePromotionDto {
  @ApiProperty({
    enum: PromotionType,
    example: PromotionType.Campaign,
    description: 'Campaign is an offer/coupon; Advertisement is an ad request.',
  })
  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @ApiPropertyOptional({
    example: 'Autumn limited set 10% off',
    maxLength: 255,
  })
  @ValidateIf((dto: CreatePromotionDto) => !dto.titleJp)
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({
    example: '秋の限定セット 10% OFF',
    maxLength: 255,
  })
  @ValidateIf((dto: CreatePromotionDto) => !dto.titleVn)
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({
    example: 'Special offer for customers who book through TABELINK.',
    description:
      'Vietnamese/English campaign or advertisement content. Required when contentJp is omitted.',
  })
  @ValidateIf((dto: CreatePromotionDto) => !dto.contentJp)
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({
    example: 'TABELINKから予約したお客様向けの特別オファーです。',
    description:
      'Japanese campaign or advertisement content. Required when contentVn is omitted.',
  })
  @ValidateIf((dto: CreatePromotionDto) => !dto.contentVn)
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiProperty({
    example: 'Japanese customers within 5km',
    maxLength: 255,
    description: 'Audience/target selected on screen ID10.',
  })
  @IsString()
  @MaxLength(255)
  targetAudience!: string;

  @ApiProperty({
    example: '2026-05-20T00:00:00.000Z',
    description: 'Start of the campaign/ad delivery period.',
  })
  @IsDateString({ strict: true })
  startDate!: string;

  @ApiProperty({
    example: '2026-05-31T23:59:59.000Z',
    description:
      'End of the campaign/ad delivery period. Must be after startDate.',
  })
  @IsDateString({ strict: true })
  endDate!: string;

  @ApiPropertyOptional({
    example: 'Cannot be combined with other coupons.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsVn?: string;

  @ApiPropertyOptional({
    example: '他のクーポンとの併用はできません。',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsJp?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/ad.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  mediaUrl?: string;

  @ApiPropertyOptional({
    example: 50000,
    minimum: 0,
    description: 'Budget/cost estimate for Advertisement requests.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;
}

export class CreateCampaignDto {
  @ApiPropertyOptional({
    example: 'Autumn limited set 10% off',
    maxLength: 255,
  })
  @ValidateIf((dto: CreateCampaignDto) => !dto.titleJp)
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({
    example: '秋の限定セット 10% OFF',
    maxLength: 255,
  })
  @ValidateIf((dto: CreateCampaignDto) => !dto.titleVn)
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({
    example: 'Special offer for customers who book through TABELINK.',
  })
  @ValidateIf((dto: CreateCampaignDto) => !dto.contentJp)
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({
    example: 'TABELINKから予約したお客様向けの特別オファーです。',
  })
  @ValidateIf((dto: CreateCampaignDto) => !dto.contentVn)
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiProperty({
    example: 'all',
    maxLength: 255,
    description: 'Audience/target selected in the new campaign popup.',
  })
  @IsString()
  @MaxLength(255)
  targetAudience!: string;

  @ApiProperty({
    example: '2026-05-20T00:00:00.000Z',
  })
  @IsDateString({ strict: true })
  startDate!: string;

  @ApiProperty({
    example: '2026-05-31T23:59:59.000Z',
  })
  @IsDateString({ strict: true })
  endDate!: string;

  @ApiPropertyOptional({
    example: 'Cannot be combined with other coupons.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsVn?: string;

  @ApiPropertyOptional({
    example: '他のクーポンとの併用はできません。',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsJp?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/campaign.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  mediaUrl?: string;
}

export class CreateAdRequestDto extends CreateCampaignDto {
  @ApiProperty({
    example: 'Japanese customers within 5km',
    maxLength: 255,
    description: 'Delivery target selected in the advertisement request popup.',
  })
  declare targetAudience: string;

  @ApiPropertyOptional({
    example: 50000,
    minimum: 0,
    description: 'Budget/cost estimate for the advertisement request.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({
    example: 'Autumn limited set 20% off',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({
    example: '秋の限定セット 20% OFF',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({
    example: 'Updated offer details.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({
    example: '更新されたキャンペーン内容です。',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiPropertyOptional({
    example: 'new',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetAudience?: string;

  @ApiPropertyOptional({
    example: '2026-05-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-06-05T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string;

  @ApiPropertyOptional({
    example: 'Updated campaign terms.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsVn?: string;

  @ApiPropertyOptional({
    example: '更新された利用条件です。',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsJp?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/updated.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  mediaUrl?: string;

  @ApiPropertyOptional({
    example: 60000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;
}
