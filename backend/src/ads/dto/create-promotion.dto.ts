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
  SNS = 'SNS',
  Notification = 'Notification',
}

export enum CampaignTargetAudience {
  All = 'all',
  New = 'new',
}

export enum CampaignDiscountType {
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount',
}

export const CAMPAIGN_PERCENTAGE_DISCOUNT_VALUES = [
  '10%',
  '20%',
  '50%',
  '100%',
] as const;

export const CAMPAIGN_FIXED_AMOUNT_DISCOUNT_VALUES = [
  '50000VND',
  '100000VND',
  '200000VND',
] as const;

export const CAMPAIGN_DISCOUNT_VALUES = [
  ...CAMPAIGN_PERCENTAGE_DISCOUNT_VALUES,
  ...CAMPAIGN_FIXED_AMOUNT_DISCOUNT_VALUES,
] as const;

export type CampaignDiscountValue = (typeof CAMPAIGN_DISCOUNT_VALUES)[number];

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

  @ApiPropertyOptional({ example: '10%' })
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
    description: 'Allowed values: all, new.',
  })
  @IsEnum(CampaignTargetAudience)
  targetAudience!: CampaignTargetAudience;

  @ApiProperty({
    enum: CampaignDiscountType,
    example: CampaignDiscountType.Percentage,
    description:
      'Discount type. Percentage uses percent dropdown values; FixedAmount uses fixed VND dropdown values.',
  })
  @IsEnum(CampaignDiscountType)
  discountType!: CampaignDiscountType;

  @ApiProperty({
    enum: CAMPAIGN_DISCOUNT_VALUES,
    example: '10%',
    description:
      'Locked discount dropdown. For Percentage use 10%, 20%, 50%, 100%; for FixedAmount use 50000VND, 100000VND, or 200000VND.',
  })
  @IsIn(CAMPAIGN_DISCOUNT_VALUES)
  discountValue!: CampaignDiscountValue;

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

  @ApiPropertyOptional({
    example: 'all',
    description:
      'Ignored for advertisements. Advertisement target audience is fixed to all.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetAudience?: string;

  @ApiProperty({
    enum: AdvertisementType,
    example: AdvertisementType.SNS,
    description:
      'SNS is the banner/SNS advertising request. Notification sends a normal notification to users.',
  })
  @IsEnum(AdvertisementType)
  advertisementType!: AdvertisementType;

  @ApiPropertyOptional({
    example: 5,
    minimum: 1,
    maximum: 100,
    description: 'Ignored for advertisements. Distance targeting is disabled.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  targetRadiusKm?: number;

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

  @ApiPropertyOptional({ example: '20%' })
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

export class AdminPromotionsQueryDto {
  @ApiPropertyOptional({
    example: 'Sushi Tokyo',
    description: 'Searches restaurant names and promotion titles.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    enum: ['Pending', 'Active', 'Rejected', 'Ended'],
    example: 'Pending',
  })
  @IsOptional()
  @IsIn(['Pending', 'Active', 'Rejected', 'Ended'])
  status?: 'Pending' | 'Active' | 'Rejected' | 'Ended';

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class RejectPromotionDto {
  @ApiProperty({
    example: 'Creative text violates the advertising policy.',
    maxLength: 2000,
  })
  @IsString()
  @MaxLength(2000)
  reason!: string;
}
