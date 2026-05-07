import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsBoolean, IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SubmitVerificationApplicationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  badgeId!: number;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v123/business-license.pdf' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  businessLicenseUrl!: string;

  @ApiProperty({ example: 'tabelink/restaurants/1/verification/business-license/license' })
  @IsString()
  @IsNotEmpty()
  businessLicensePublicId!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v123/food-safety.pdf' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true })
  foodSafetyCertUrl!: string;

  @ApiProperty({ example: 'tabelink/restaurants/1/verification/food-safety/certificate' })
  @IsString()
  @IsNotEmpty()
  foodSafetyCertPublicId!: string;

  @ApiProperty({
    example: true,
    description: 'ID13 checkbox confirming agreement and document accuracy.',
  })
  @IsBoolean()
  @Equals(true)
  agreedToTerms!: true;
}
