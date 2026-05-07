import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DinerProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Foodie' })
  displayName!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '12/31/1990' })
  dob!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Female' })
  gender!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Japan' })
  nationality!: string;
}
