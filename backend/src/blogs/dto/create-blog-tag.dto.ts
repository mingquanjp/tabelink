import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateBlogTagDto {
  @ApiProperty({ example: '#HanoiDining' })
  @IsString()
  @MaxLength(100)
  name!: string;
}
