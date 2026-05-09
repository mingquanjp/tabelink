import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { FeatureMaster } from '../entities/feature-master.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { RestaurantFeature } from '../entities/restaurant-feature.entity';
import {
  RestaurantMedia,
  RestaurantMediaStatus,
} from '../entities/restaurant-media.entity';
import { RestaurantPaymentMethod } from '../entities/restaurant-payment-method.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(FeatureMaster)
    private readonly featureRepo: Repository<FeatureMaster>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    private readonly dataSource: DataSource,
  ) {}

  async listOwnerRestaurants(user: JwtPayload) {
    this.assertOwner(user);

    const restaurants = await this.restaurantRepo.find({
      where: { ownerAccountId: user.sub },
      order: { restaurantId: 'ASC' },
    });

    return {
      count: restaurants.length,
      restaurants: restaurants.map((restaurant) => this.toSummaryResponse(restaurant)),
    };
  }

  async getOptions() {
    const [features, paymentMethods] = await Promise.all([
      this.featureRepo.find({ order: { featureId: 'ASC' } }),
      this.paymentMethodRepo.find({ order: { paymentMethodId: 'ASC' } }),
    ]);

    return {
      features: features.map((feature) => ({
        featureId: feature.featureId,
        featureCode: feature.featureCode,
        featureNameVn: feature.featureNameVn,
        featureNameJp: feature.featureNameJp,
      })),
      paymentMethods: paymentMethods.map((method) => ({
        paymentMethodId: method.paymentMethodId,
        methodCode: method.methodCode,
        methodName: method.methodName,
      })),
    };
  }

  async findOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    const restaurant = await this.findOwnedRestaurantWithRelations(restaurantId, user);
    return this.toDetailResponse(restaurant);
  }

  async update(restaurantId: number, dto: UpdateRestaurantDto, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const saved = await this.dataSource.transaction(async (manager) => {
      const restaurant = await manager.findOneOrFail(Restaurant, {
        where: { restaurantId, ownerAccountId: user.sub },
      });

      if (dto.nameVn !== undefined) {
        restaurant.nameVn = this.requiredTrim(dto.nameVn, 'nameVn');
      }

      if (dto.nameJp !== undefined) {
        restaurant.nameJp = this.requiredTrim(dto.nameJp, 'nameJp');
      }

      if (dto.address !== undefined) {
        restaurant.address = this.requiredTrim(dto.address, 'address');
      }

      if (dto.latitude !== undefined) {
        restaurant.latitude = dto.latitude.toFixed(8);
      }

      if (dto.longitude !== undefined) {
        restaurant.longitude = dto.longitude.toFixed(8);
      }

      if (dto.descriptionVn !== undefined) {
        restaurant.descriptionVn = this.optionalTrim(dto.descriptionVn) ?? null;
      }

      if (dto.descriptionJp !== undefined) {
        restaurant.descriptionJp = this.optionalTrim(dto.descriptionJp) ?? null;
      }

      if (dto.phone !== undefined) {
        restaurant.phone = this.optionalTrim(dto.phone) ?? null;
      }

      if (dto.openingHours !== undefined) {
        restaurant.openingHours = this.optionalTrim(dto.openingHours) ?? null;
      }

      if (dto.issuesVat !== undefined) {
        restaurant.issuesVat = dto.issuesVat;
      }

      await manager.save(Restaurant, restaurant);

      if (dto.featureIds !== undefined) {
        await this.replaceFeatureLinks(manager, restaurantId, dto.featureIds);
      }

      if (dto.paymentMethodIds !== undefined) {
        await this.replacePaymentMethodLinks(manager, restaurantId, dto.paymentMethodIds);
      }

      if (dto.media !== undefined) {
        await manager.delete(RestaurantMedia, { restaurantId });

        if (dto.media.length) {
          const media = dto.media.map((item, index) =>
            manager.create(RestaurantMedia, {
              restaurantId,
              mediaUrl: item.mediaUrl.trim(),
              mediaType: item.mediaType,
              sortOrder: item.sortOrder ?? index,
              status: RestaurantMediaStatus.Pending,
            }),
          );

          await manager.save(RestaurantMedia, media);
        }
      }

      return manager.findOneOrFail(Restaurant, {
        where: { restaurantId },
        relations: {
          media: true,
          featureLinks: { feature: true },
          paymentMethodLinks: { paymentMethod: true },
        },
        order: {
          media: { sortOrder: 'ASC', mediaId: 'ASC' },
          featureLinks: { featureId: 'ASC' },
          paymentMethodLinks: { paymentMethodId: 'ASC' },
        },
      });
    });

    return this.toDetailResponse(saved);
  }

  private assertOwner(user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException('Only restaurant owners can manage restaurant information.');
    }
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    this.assertOwner(user);

    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, ownerAccountId: user.sub },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }

  private async findOwnedRestaurantWithRelations(restaurantId: number, user: JwtPayload) {
    this.assertOwner(user);

    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, ownerAccountId: user.sub },
      relations: {
        media: true,
        featureLinks: { feature: true },
        paymentMethodLinks: { paymentMethod: true },
      },
      order: {
        media: { sortOrder: 'ASC', mediaId: 'ASC' },
        featureLinks: { featureId: 'ASC' },
        paymentMethodLinks: { paymentMethodId: 'ASC' },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }

    return restaurant;
  }

  private async replaceFeatureLinks(
    manager: EntityManager,
    restaurantId: number,
    featureIds: number[],
  ) {
    await this.assertIdsExist(
      manager.getRepository(FeatureMaster),
      featureIds,
      'featureId',
      'Feature',
    );

    await manager.delete(RestaurantFeature, { restaurantId });

    if (!featureIds.length) {
      return;
    }

    await manager.save(
      RestaurantFeature,
      featureIds.map((featureId) => ({ restaurantId, featureId })),
    );
  }

  private async replacePaymentMethodLinks(
    manager: EntityManager,
    restaurantId: number,
    paymentMethodIds: number[],
  ) {
    await this.assertIdsExist(
      manager.getRepository(PaymentMethod),
      paymentMethodIds,
      'paymentMethodId',
      'Payment method',
    );

    await manager.delete(RestaurantPaymentMethod, { restaurantId });

    if (!paymentMethodIds.length) {
      return;
    }

    await manager.save(
      RestaurantPaymentMethod,
      paymentMethodIds.map((paymentMethodId) => ({ restaurantId, paymentMethodId })),
    );
  }

  private async assertIdsExist<Entity extends object>(
    repository: Repository<Entity>,
    ids: number[],
    property: keyof Entity,
    label: string,
  ) {
    if (!ids.length) {
      return;
    }

    const rows = await repository.find({
      where: { [property]: In(ids) } as any,
    });

    if (rows.length !== ids.length) {
      throw new BadRequestException(`${label} selection contains unknown IDs.`);
    }
  }

  private requiredTrim(value: string, fieldName: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new BadRequestException(`${fieldName} must not be empty.`);
    }

    return trimmed;
  }

  private optionalTrim(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private toSummaryResponse(restaurant: Restaurant) {
    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
      status: restaurant.status,
      updatedAt: restaurant.updatedAt,
    };
  }

  private toDetailResponse(restaurant: Restaurant) {
    return {
      restaurantId: restaurant.restaurantId,
      ownerAccountId: restaurant.ownerAccountId,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
      latitude: restaurant.latitude === null || restaurant.latitude === undefined ? null : Number(restaurant.latitude),
      longitude: restaurant.longitude === null || restaurant.longitude === undefined ? null : Number(restaurant.longitude),
      descriptionVn: restaurant.descriptionVn ?? null,
      descriptionJp: restaurant.descriptionJp ?? null,
      phone: restaurant.phone ?? null,
      openingHours: restaurant.openingHours ?? null,
      issuesVat: restaurant.issuesVat,
      status: restaurant.status,
      features: (restaurant.featureLinks ?? [])
        .sort((a, b) => a.featureId - b.featureId)
        .map((link) => ({
          featureId: link.featureId,
          featureCode: link.feature?.featureCode,
          featureNameVn: link.feature?.featureNameVn,
          featureNameJp: link.feature?.featureNameJp,
        })),
      paymentMethods: (restaurant.paymentMethodLinks ?? [])
        .sort((a, b) => a.paymentMethodId - b.paymentMethodId)
        .map((link) => ({
          paymentMethodId: link.paymentMethodId,
          methodCode: link.paymentMethod?.methodCode,
          methodName: link.paymentMethod?.methodName,
        })),
      media: (restaurant.media ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder || a.mediaId - b.mediaId)
        .map((media) => ({
          mediaId: media.mediaId,
          mediaUrl: media.mediaUrl,
          mediaType: media.mediaType,
          sortOrder: media.sortOrder,
          status: media.status,
        })),
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }
}
