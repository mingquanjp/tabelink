import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export enum PromotionType {
  Campaign = 'Campaign',
  Advertisement = 'Advertisement',
}

export enum AdvertisementType {
  Banner = 'Banner',
  Push = 'Push',
}

export enum CampaignTargetAudience {
  All = 'all',
  New = 'new',
  Elite = 'elite',
}

export const CAMPAIGN_DISCOUNT_TYPES = [
  '10_once',
  '10',
  '20',
  '30',
  '40',
  '50',
  '60',
  '70',
  '80',
  '90',
] as const;

export type CampaignDiscountType = (typeof CAMPAIGN_DISCOUNT_TYPES)[number];

export class CreatePromotionDto {
  @ApiProperty({
    enum: PromotionType,
    example: PromotionType.Campaign,
    description:
      'Generic endpoint only. Screen ID10 should prefer /owner/campaigns or /owner/ads/requests.',
  })
  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @ApiPropertyOptional({ example: 'Autumn limited set 10% off' })
  @ValidateIf((dto: CreatePromotionDto) => !dto.titleJp)
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({ example: 'Autumn limited set 10% off' })
  @ValidateIf((dto: CreatePromotionDto) => !dto.titleVn)
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({ example: 'Special offer details.' })
  @ValidateIf((dto: CreatePromotionDto) => !dto.contentJp)
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({ example: 'Special offer details.' })
  @ValidateIf((dto: CreatePromotionDto) => !dto.contentVn)
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiProperty({ example: 'all' })
  @IsString()
  @MaxLength(255)
  targetAudience!: string;

  @ApiProperty({ example: '2026-05-20T00:00:00.000Z' })
  @IsDateString({ strict: true })
  startDate!: string;

  @ApiProperty({ example: '2026-05-31T23:59:59.000Z' })
  @IsDateString({ strict: true })
  endDate!: string;

  @ApiPropertyOptional({ example: 'Cannot be combined with other coupons.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsVn?: string;

  @ApiPropertyOptional({ example: 'Cannot be combined with other coupons.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsJp?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discountType?: string;

  @ApiPropertyOptional({ example: '10%OFF' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  discountValue?: string;

  @ApiPropertyOptional({ enum: AdvertisementType })
  @IsOptional()
  @IsEnum(AdvertisementType)
  advertisementType?: AdvertisementType;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  targetRadiusKm?: number;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/ad.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  mediaUrl?: string;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;
}

export class CreateCampaignDto {
  @ApiProperty({
    example: 'Autumn limited campaign',
    maxLength: 255,
    description: 'Campaign name from screen ID10.',
  })
  @IsString()
  @MaxLength(255)
  campaignName!: string;

  @ApiProperty({
    example: '10% discount for selected customers.',
    maxLength: 4000,
    description: 'Campaign description from screen ID10.',
  })
  @IsString()
  @MaxLength(4000)
  campaignDescription!: string;

  @ApiProperty({
    enum: CampaignTargetAudience,
    example: CampaignTargetAudience.All,
    description: 'Allowed values: all, new, elite.',
  })
  @IsEnum(CampaignTargetAudience)
  targetAudience!: CampaignTargetAudience;

  @ApiProperty({
    enum: CAMPAIGN_DISCOUNT_TYPES,
    example: '10',
    description:
      'Discount dropdown value. 10_once means one-time 10%; 10,20,30... are percent options.',
  })
  @IsIn(CAMPAIGN_DISCOUNT_TYPES)
  discountType!: CampaignDiscountType;

  @ApiPropertyOptional({ example: '10%OFF', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  discountValue?: string;

  @ApiPropertyOptional({
    example: 'Cannot be combined with other coupons.',
    maxLength: 4000,
    description: 'Note/caution text shown in the campaign popup.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string;

  @ApiProperty({ example: '2026-05-20T00:00:00.000Z' })
  @IsDateString({ strict: true })
  startDate!: string;

  @ApiProperty({ example: '2026-05-31T23:59:59.000Z' })
  @IsDateString({ strict: true })
  endDate!: string;
}

export class CreateAdRequestDto {
  @ApiPropertyOptional({ example: 'Weekend banner ad' })
  @ValidateIf((dto: CreateAdRequestDto) => !dto.titleJp)
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({ example: 'Weekend banner ad' })
  @ValidateIf((dto: CreateAdRequestDto) => !dto.titleVn)
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({ example: 'Promote a weekend limited menu.' })
  @ValidateIf((dto: CreateAdRequestDto) => !dto.contentJp)
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({ example: 'Promote a weekend limited menu.' })
  @ValidateIf((dto: CreateAdRequestDto) => !dto.contentVn)
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiProperty({ example: 'Japanese customers within 5km' })
  @IsString()
  @MaxLength(255)
  targetAudience!: string;

  @ApiProperty({ enum: AdvertisementType, example: AdvertisementType.Banner })
  @IsEnum(AdvertisementType)
  advertisementType!: AdvertisementType;

  @ApiProperty({ example: 5, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  targetRadiusKm!: number;

  @ApiPropertyOptional({
    example: '10',
    description: 'Required for Banner ads when the discount dropdown is shown.',
  })
  @ValidateIf(
    (dto: CreateAdRequestDto) =>
      dto.advertisementType === AdvertisementType.Banner,
  )
  @IsString()
  @MaxLength(100)
  discountType?: string;

  @ApiPropertyOptional({ example: '10%OFF' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  discountValue?: string;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/ad.jpg',
  })
  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  mediaUrl?: string;

  @ApiProperty({ example: '2026-05-20T00:00:00.000Z' })
  @IsDateString({ strict: true })
  startDate!: string;

  @ApiProperty({ example: '2026-05-27T23:59:59.000Z' })
  @IsDateString({ strict: true })
  endDate!: string;
}

export class UpdatePromotionDto {
  @ApiPropertyOptional({ example: 'Updated campaign name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleVn?: string;

  @ApiPropertyOptional({ example: 'Updated campaign name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleJp?: string;

  @ApiPropertyOptional({ example: 'Updated campaign details.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentVn?: string;

  @ApiPropertyOptional({ example: 'Updated campaign details.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentJp?: string;

  @ApiPropertyOptional({ example: 'new' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetAudience?: string;

  @ApiPropertyOptional({ example: '2026-05-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-05T23:59:59.000Z' })
  @IsOptional()
  @IsDateString({ strict: true })
  endDate?: string;

  @ApiPropertyOptional({ example: 'Updated note.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  termsVn?: string;

  @ApiPropertyOptional({ example: 'Updated note.' })
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

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  discountType?: string;

  @ApiPropertyOptional({ example: '20%OFF' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  discountValue?: string;

  @ApiPropertyOptional({ enum: AdvertisementType })
  @IsOptional()
  @IsEnum(AdvertisementType)
  advertisementType?: AdvertisementType;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  targetRadiusKm?: number;

  @ApiPropertyOptional({ example: 60000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalCost?: number;
}
