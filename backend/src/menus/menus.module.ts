import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemCriterion } from '../entities/menu-item-criterion.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { MenuImagesService } from './menu-images.service';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem, MenuItemCriterion, Restaurant])],
  controllers: [MenusController],
  providers: [MenusService, MenuImagesService],
})
export class MenusModule {}
