import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { MenuItemCriterion } from '../entities/menu-item-criterion.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly dataSource: DataSource,
  ) {}

  async list(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const items = await this.menuRepo.find({
      where: { restaurantId },
      relations: {
        criteria: true,
      },
      order: {
        isActive: 'DESC',
        isRecommendedForJp: 'DESC',
        itemId: 'ASC',
        criteria: {
          sortOrder: 'ASC',
          criterionId: 'ASC',
        },
      },
    });

    return {
      restaurantId,
      count: items.length,
      items: items.map((item) => this.toResponse(item)),
    };
  }

  async findOne(restaurantId: number, itemId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const item = await this.findOwnedMenuItem(restaurantId, itemId);

    return this.toResponse(item);
  }

  async create(restaurantId: number, dto: CreateMenuItemDto, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const saved = await this.dataSource.transaction(async (manager) => {
      const item = manager.create(MenuItem, {
        restaurantId,
        nameVn: dto.nameVn.trim(),
        nameJp: dto.nameJp.trim(),
        price: dto.price.toFixed(2),
        descriptionVn: this.optionalTrim(dto.descriptionVn),
        descriptionJp: this.optionalTrim(dto.descriptionJp),
        ingredients: this.optionalTrim(dto.ingredients),
        isRecommendedForJp: dto.isRecommendedForJp ?? false,
        spicyLevel: dto.spicyLevel ?? 0,
        corianderLevel: dto.corianderLevel ?? 0,
        imageUrl: this.optionalTrim(dto.imageUrl),
        isActive: dto.isActive ?? true,
      });

      const savedItem = await manager.save(MenuItem, item);
      await this.replaceCriteria(manager.getRepository(MenuItemCriterion), savedItem.itemId, dto.criteria);

      return manager.findOneOrFail(MenuItem, {
        where: { itemId: savedItem.itemId },
        relations: { criteria: true },
        order: {
          criteria: {
            sortOrder: 'ASC',
            criterionId: 'ASC',
          },
        },
      });
    });

    return this.toResponse(saved);
  }

  async update(
    restaurantId: number,
    itemId: number,
    dto: UpdateMenuItemDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const item = await this.findOwnedMenuItem(restaurantId, itemId);

    const saved = await this.dataSource.transaction(async (manager) => {
      if (dto.nameVn !== undefined) {
        item.nameVn = dto.nameVn.trim();
      }

      if (dto.nameJp !== undefined) {
        item.nameJp = dto.nameJp.trim();
      }

      if (dto.price !== undefined) {
        item.price = dto.price.toFixed(2);
      }

      if (dto.descriptionVn !== undefined) {
        item.descriptionVn = this.optionalTrim(dto.descriptionVn);
      }

      if (dto.descriptionJp !== undefined) {
        item.descriptionJp = this.optionalTrim(dto.descriptionJp);
      }

      if (dto.ingredients !== undefined) {
        item.ingredients = this.optionalTrim(dto.ingredients);
      }

      if (dto.isRecommendedForJp !== undefined) {
        item.isRecommendedForJp = dto.isRecommendedForJp;
      }

      if (dto.spicyLevel !== undefined) {
        item.spicyLevel = dto.spicyLevel;
      }

      if (dto.corianderLevel !== undefined) {
        item.corianderLevel = dto.corianderLevel;
      }

      if (dto.imageUrl !== undefined) {
        item.imageUrl = this.optionalTrim(dto.imageUrl);
      }

      if (dto.isActive !== undefined) {
        item.isActive = dto.isActive;
      }

      await manager.save(MenuItem, item);

      if (dto.criteria !== undefined) {
        await this.replaceCriteria(manager.getRepository(MenuItemCriterion), item.itemId, dto.criteria);
      }

      return manager.findOneOrFail(MenuItem, {
        where: { itemId: item.itemId },
        relations: { criteria: true },
        order: {
          criteria: {
            sortOrder: 'ASC',
            criterionId: 'ASC',
          },
        },
      });
    });

    return this.toResponse(saved);
  }

  async remove(restaurantId: number, itemId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const item = await this.findOwnedMenuItem(restaurantId, itemId);
    await this.menuRepo.remove(item);

    return {
      deleted: true,
      itemId,
      restaurantId,
    };
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException('Only restaurant owners can manage menus.');
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerAccountId: user.sub,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }

  private async findOwnedMenuItem(restaurantId: number, itemId: number) {
    const item = await this.menuRepo.findOne({
      where: {
        restaurantId,
        itemId,
      },
      relations: {
        criteria: true,
      },
      order: {
        criteria: {
          sortOrder: 'ASC',
          criterionId: 'ASC',
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Menu item not found.');
    }

    return item;
  }

  private optionalTrim(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private async replaceCriteria(
    repository: Repository<MenuItemCriterion>,
    itemId: number,
    criteria?: CreateMenuItemDto['criteria'],
  ) {
    await repository.delete({ itemId });

    if (!criteria?.length) {
      return;
    }

    const entities = criteria.map((criterion, index) =>
      repository.create({
        itemId,
        criterionName: criterion.criterionName.trim(),
        ratingLevel: criterion.ratingLevel,
        sortOrder: index,
      }),
    );

    await repository.save(entities);
  }

  private toResponse(item: MenuItem) {
    return {
      itemId: item.itemId,
      restaurantId: item.restaurantId,
      nameVn: item.nameVn,
      nameJp: item.nameJp,
      price: Number(item.price),
      descriptionVn: item.descriptionVn ?? null,
      descriptionJp: item.descriptionJp ?? null,
      ingredients: item.ingredients ?? null,
      isRecommendedForJp: item.isRecommendedForJp,
      spicyLevel: item.spicyLevel,
      corianderLevel: item.corianderLevel,
      criteria: (item.criteria ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder || a.criterionId - b.criterionId)
        .map((criterion) => ({
          criterionId: criterion.criterionId,
          criterionName: criterion.criterionName,
          ratingLevel: criterion.ratingLevel,
          sortOrder: criterion.sortOrder,
        })),
      imageUrl: item.imageUrl ?? null,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
