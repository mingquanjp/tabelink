import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteMenuImageDto {
  @ApiProperty({
    example: 'tabelink/restaurants/1/menus/pho-bo',
    description: 'Cloudinary public_id returned by the menu image upload API.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  publicId!: string;
}
