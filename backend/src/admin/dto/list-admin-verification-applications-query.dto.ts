import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListAdminVerificationApplicationsQueryDto {
  @ApiPropertyOptional({
    enum: ['all', 'Pending', 'Approved', 'Rejected'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'Pending', 'Approved', 'Rejected'])
  status?: 'all' | 'Pending' | 'Approved' | 'Rejected';

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 24, minimum: 1, maximum: 100, default: 24 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
