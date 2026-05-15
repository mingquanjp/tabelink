import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { BlogMediaService } from './blog-media.service';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant])],
  controllers: [BlogsController],
  providers: [BlogsService, BlogMediaService],
})
export class BlogsModule {}
