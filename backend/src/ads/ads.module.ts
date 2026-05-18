import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsMediaService } from './ads-media.service';
import { AdsService } from './ads.service';

@Module({
  controllers: [AdsController],
  providers: [AdsService, AdsMediaService],
})
export class AdsModule {}
