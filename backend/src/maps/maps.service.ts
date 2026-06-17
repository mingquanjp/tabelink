import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { DataSource, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import type { GetRestaurantRouteQueryDto } from './dto/get-restaurant-route-query.dto';
import { SearchRestaurantDto } from './dto/restaurant-map-search.dto';

type LatLng = {
  lat: number;
  lng: number;
};

const MIN_LAT = -90;
const MAX_LAT = 90;
const MIN_LNG = -180;
const MAX_LNG = 180;

interface RestaurantLocationRow {
  restaurantId: number | string;
  nameVn: string;
  nameJp: string;
  address: string;
  latitude: number | string | null;
  longitude: number | string | null;
}

interface OsrmRouteResponse {
  code?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
}

type OsrmRoute = NonNullable<OsrmRouteResponse['routes']>[number];

@Injectable()
export class MapsService {
  private readonly osrmBaseUrl: string;
  private readonly osrmTimeoutMs: number;

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.osrmBaseUrl = this.configService
      .get<string>('OSRM_BASE_URL', 'https://router.project-osrm.org')
      .replace(/\/+$/, '');
    this.osrmTimeoutMs = this.resolveTimeoutMs();
  }
  async searchRestaurants(dto: SearchRestaurantDto, user: JwtPayload) {
    // Implementation for searching restaurants
    this.assertMapViewer(user);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    const query = this.restaurantRepo
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.media', 'media')
      .leftJoinAndSelect('restaurant.restaurantBadges', 'rb')
      .leftJoinAndSelect('rb.badge', 'badge')
      .leftJoinAndSelect('restaurant.featureLinks', 'featureLinks')
      .leftJoinAndSelect('featureLinks.feature', 'feature')
      .where('restaurant.status = :status', { status: 'Active' })
      .andWhere('restaurant.latitude IS NOT NULL')
      .andWhere('restaurant.longitude IS NOT NULL');
    query.addSelect((subQuery) => {
      return subQuery
        .select('AVG(rev.rating)', 'avgRating')
        .from('review', 'rev') // lấy từ bảng review
        .where('rev.restaurantid = restaurant.restaurantid')
        .andWhere('rev.status = :revStatus', { revStatus: 'Visible' });
    }, 'avgRating');

    if (dto.keyword) {
      query.andWhere(
        '(restaurant.nameVn ILIKE :keyword OR restaurant.nameJp ILIKE :keyword OR restaurant.address ILIKE :keyword)',
        { keyword: `%${dto.keyword.trim()}%` },
      );
    }
    if (dto.issuesVAT !== undefined) {
      query.andWhere('restaurant.issuesVat = :issuesVAT', {
        issuesVAT: dto.issuesVAT,
      });
    }
    if (dto.lat !== undefined && dto.lng !== undefined) {
      const haversine = `(6371000 * acos(cos(radians(:lat)) * cos(radians(restaurant.latitude)) * cos(radians(restaurant.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(restaurant.latitude))))`;
      query.addSelect(haversine, 'distance');
      query.setParameters({ lat: dto.lat, lng: dto.lng });
      if (dto.radius) {
        query.andWhere(`${haversine} <= :radius`, { radius: dto.radius });
      }
      query.orderBy('distance', 'ASC');
    } else {
      query.orderBy('restaurant.createdAt', 'DESC');
    }
    if (dto.dishTypes?.length) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM menu_item mi WHERE mi.restaurantid = restaurant.restaurantid AND mi.categoryid IN (:...dishTypes))`,
        { dishTypes: dto.dishTypes },
      );
    }
    if (dto.services?.length) {
      query.andWhere(
        `EXISTS (SELECT 1 FROM restaurant_feature rf WHERE rf.restaurantid = restaurant.restaurantid AND rf.featureid IN (:...services))`,
        { services: dto.services },
      );
    }
    if (dto.japaneseStandards?.length) {
      const hasHygiene = dto.japaneseStandards.includes(-1);
      const otherStandards = dto.japaneseStandards.filter((id) => id !== -1);

      if (otherStandards.length) {
        query.andWhere(
          `EXISTS (SELECT 1 FROM restaurant_feature rf WHERE rf.restaurantid = restaurant.restaurantid AND rf.featureid IN (:...otherStandards))`,
          { otherStandards },
        );
      }
      if (hasHygiene) {
        query.andWhere(
          `EXISTS (SELECT 1 FROM review r WHERE r.restaurantid = restaurant.restaurantid AND r.status = 'Visible' GROUP BY r.restaurantid HAVING AVG(r.rating) >= 4.0)`,
        );
      }
    }

    const totalCount = await query.getCount();
    query.skip(skip).take(limit);
    const { entities, raw } = await query.getRawAndEntities();
    const items = entities.map((entity, index) => {
      const rawData = raw[index];
      const distanceMeters = rawData?.distance
        ? parseFloat(rawData.distance)
        : undefined;
      const avgRating = rawData?.avgRating
        ? Number(parseFloat(rawData.avgRating).toFixed(1))
        : 0;
      return this.transformToMapRestaurant(entity, distanceMeters, avgRating);
    });
    return { items, totalCount, page, limit };
  }

  async getMapRestaurants(user: JwtPayload) {
    return this.searchRestaurants({ page: 1, limit: 100 }, user);
  }

  async getRestaurantRoute(
    restaurantId: number,
    query: GetRestaurantRouteQueryDto,
    user: JwtPayload,
  ) {
    this.assertMapViewer(user);

    const origin = {
      lat: query.originLat,
      lng: query.originLng,
    };

    this.assertLatLng(origin, 'origin');

    const routeTarget = await this.resolveRouteTarget(restaurantId);
    const route = await this.fetchOsrmRoute(origin, routeTarget.destination);

    return {
      restaurantId,
      origin,
      destination: {
        lat: routeTarget.destination.lat,
        lng: routeTarget.destination.lng,
        nameVn: routeTarget.nameVn,
        nameJp: routeTarget.nameJp,
        address: routeTarget.address,
      },
      provider: 'osrm' as const,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      geometry: route.geometry,
    };
  }

  private assertMapViewer(user: JwtPayload) {
    if (![AuthRole.User, AuthRole.Guest].includes(user.role)) {
      throw new ForbiddenException(
        'Only customer or guest users can request map routes.',
      );
    }
  }

  private async findActiveRestaurantLocation(restaurantId: number) {
    const rows = await this.dataSource.query<RestaurantLocationRow[]>(
      `
        SELECT
          RestaurantID AS "restaurantId",
          NameVN AS "nameVn",
          NameJP AS "nameJp",
          Address AS "address",
          Latitude AS "latitude",
          Longitude AS "longitude"
        FROM RESTAURANT
        WHERE RestaurantID = $1
          AND Status = 'Active'
        LIMIT 1
      `,
      [restaurantId],
    );

    const row = rows[0];

    if (!row) {
      throw new NotFoundException('Active restaurant was not found.');
    }

    return row;
  }

  private async resolveRouteTarget(restaurantId: number) {
    const restaurant = await this.findActiveRestaurantLocation(restaurantId);
    const destination = this.toDestinationPoint(restaurant);

    return {
      destination,
      nameVn: restaurant.nameVn,
      nameJp: restaurant.nameJp,
      address: restaurant.address,
    };
  }

  private toDestinationPoint(restaurant: RestaurantLocationRow): LatLng {
    if (restaurant.latitude === null || restaurant.longitude === null) {
      throw new NotFoundException('Restaurant location is unavailable.');
    }

    const lat = Number(restaurant.latitude);
    const lng = Number(restaurant.longitude);

    if (!this.isValidLatLng({ lat, lng })) {
      throw new NotFoundException('Restaurant location is unavailable.');
    }

    return { lat, lng };
  }

  private async fetchOsrmRoute(origin: LatLng, destination: LatLng) {
    const params = new URLSearchParams({
      geometries: 'geojson',
      overview: 'full',
    });
    const url =
      `${this.osrmBaseUrl}/route/v1/driving/` +
      `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
      `?${params.toString()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.osrmTimeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new BadGatewayException('Route provider failed.');
      }

      const data = (await response.json()) as OsrmRouteResponse;
      const route = data.routes?.[0];
      const coordinates = route?.geometry?.coordinates;

      if (!this.isValidOsrmRoute(route, coordinates)) {
        throw new BadGatewayException('Route provider failed.');
      }

      return {
        distanceMeters: route!.distance!,
        durationSeconds: route!.duration!,
        geometry: coordinates!.map(([lng, lat]) => ({ lat, lng })),
      };
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException('Route provider failed.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private resolveTimeoutMs() {
    const rawValue = this.configService.get<string>('OSRM_TIMEOUT_MS');
    const value = rawValue === undefined ? 5000 : Number(rawValue);

    return Number.isFinite(value) && value > 0 ? value : 5000;
  }

  private assertLatLng(point: LatLng, label: 'origin' | 'destination') {
    if (!this.isValidLatLng(point)) {
      throw new BadRequestException(`Invalid ${label} coordinates.`);
    }
  }

  private isValidLatLng(point: LatLng) {
    return (
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      point.lat >= MIN_LAT &&
      point.lat <= MAX_LAT &&
      point.lng >= MIN_LNG &&
      point.lng <= MAX_LNG
    );
  }

  private isValidOsrmRoute(
    route: OsrmRoute | undefined,
    coordinates: Array<[number, number]> | undefined,
  ) {
    return (
      typeof route?.distance === 'number' &&
      Number.isFinite(route.distance) &&
      route.distance >= 0 &&
      typeof route.duration === 'number' &&
      Number.isFinite(route.duration) &&
      route.duration >= 0 &&
      Array.isArray(coordinates) &&
      coordinates.length > 0 &&
      coordinates.every(
        ([lng, lat]) =>
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          lat >= MIN_LAT &&
          lat <= MAX_LAT &&
          lng >= MIN_LNG &&
          lng <= MAX_LNG,
      )
    );
  }

  private transformToMapRestaurant(
    entity: Restaurant,
    distanceMeters?: number,
    avgRating?: number,
  ) {
    const featureCodes =
      entity.featureLinks?.map((fl) => fl.feature.featureCode) || [];
    const featureSet = new Set(featureCodes);

    // Xác định Cuisine từ Features hoặc mặc định
    let cuisine = 'ベトナム料理';
    const cuisineTag = featureCodes.find((f) => f.startsWith('cuisine_'));
    if (cuisineTag) cuisine = cuisineTag.replace('cuisine_', '');

    // Amenities (vat, parking, privateRoom)
    const amenities: string[] = [];
    if (entity.issuesVat || featureSet.has('VAT_INVOICE'))
      amenities.push('vat');
    if (featureSet.has('PARKING')) amenities.push('parking');
    if (featureSet.has('PRIVATE_ROOM')) amenities.push('privateRoom');

    // Badges từ DB
    const badges =
      entity.restaurantBadges?.map((rb) => rb.badge.badgeNameJp) || [];
    const isVerified =
      entity.restaurantBadges?.some(
        (rb) => rb.badge.badgeCode === 'VERIFIED',
      ) || false;

    let distanceStr = '---';
    let distValue: '500m' | '1.0km' | '5km' = '5km';

    if (distanceMeters !== undefined) {
      if (distanceMeters < 1000) {
        distanceStr = `${Math.round(distanceMeters)}m`;
      } else {
        distanceStr = `${(distanceMeters / 1000).toFixed(1)}km`;
      }
      if (distanceMeters <= 500) distValue = '500m';
      else if (distanceMeters <= 1000) distValue = '1.0km';
      else distValue = '5km';
    }

    return {
      id: entity.restaurantId,
      name: entity.nameVn,
      mapName: entity.nameJp || entity.nameVn,
      address: entity.address,
      position: { lat: Number(entity.latitude), lng: Number(entity.longitude) },
      distance: distanceMeters
        ? `${(distanceMeters / 1000).toFixed(1)}km`
        : '---',
      distanceValue: distValue,

      rating: avgRating,
      imageUrl:
        entity.media?.find((m) => m.mediaType === 'Cover')?.mediaUrl ||
        entity.media?.[0]?.mediaUrl ||
        '',
      isVerified,
      hasJapaneseStaff: featureSet.has('JAPANESE_STAFF'),
      hasJapaneseMenu: featureSet.has('JAPANESE_MENU'),
      cuisine,
      amenities,
      badges,
      features: featureCodes,
    };
  }
}
