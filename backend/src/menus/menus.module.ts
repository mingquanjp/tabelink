import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItemCriterion } from './entities/menu-item-criterion.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuImagesService } from './menu-images.service';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItem,
      MenuItemCriterion,
      MenuCategory,
      Restaurant,
    ]),
  ],
  controllers: [MenusController],
  providers: [MenusService, MenuImagesService],
})
export class MenusModule {}
