import {
  BadRequestException,
  BadGatewayException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';
import type { GetRestaurantRouteQueryDto } from './dto/get-restaurant-route-query.dto';

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
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.osrmBaseUrl = this.configService
      .get<string>('OSRM_BASE_URL', 'https://router.project-osrm.org')
      .replace(/\/+$/, '');
    this.osrmTimeoutMs = this.resolveTimeoutMs();
  }

  async getMapRestaurants(user: JwtPayload) {
    this.assertMapViewer(user);

    const rows = await this.dataSource.query(`
      SELECT 
        r.RestaurantID AS "id",
        r.NameVN AS "name",
        r.NameJP AS "mapName",
        r.Address AS "address",
        r.Latitude AS "lat",
        r.Longitude AS "lng",
        r.IssuesVat AS "issuesVat",
        COALESCE(reviews."ratingValue", 0) AS "ratingValue",
        COALESCE(reviews."reviewCount", 0) AS "reviewCount",
        media."imageUrl",
        COALESCE(features."features", '[]'::json) AS "features"
      FROM RESTAURANT r
      LEFT JOIN LATERAL (
        SELECT
          AVG(rev.Rating) AS "ratingValue",
          COUNT(rev.ReviewID) AS "reviewCount"
        FROM REVIEW rev
        WHERE rev.RestaurantID = r.RestaurantID
          AND rev.Status = 'Visible'
      ) reviews ON true
      LEFT JOIN LATERAL (
        SELECT m.MediaURL AS "imageUrl"
        FROM RESTAURANT_MEDIA m
        WHERE m.RestaurantID = r.RestaurantID
          AND m.Status = 'Approved'
        ORDER BY
          CASE WHEN m.MediaType = 'Cover' THEN 0 ELSE 1 END,
          m.SortOrder ASC,
          m.MediaID ASC
        LIMIT 1
      ) media ON true
      LEFT JOIN LATERAL (
        SELECT JSON_AGG(fm.FeatureCode ORDER BY fm.FeatureCode) AS "features"
        FROM RESTAURANT_FEATURE rf
        INNER JOIN FEATURE_MASTER fm ON fm.FeatureID = rf.FeatureID
        WHERE rf.RestaurantID = r.RestaurantID
      ) features ON true
      WHERE r.Status = 'Active' 
        AND r.Latitude IS NOT NULL 
        AND r.Longitude IS NOT NULL
      ORDER BY r.RestaurantID
    `);

    return rows.map((row: any) => {
      const features: string[] =
        typeof row.features === 'string'
          ? JSON.parse(row.features)
          : row.features || [];
      const featureSet = new Set(features);
      
      const isVerified = true;
      const hasJapaneseStaff = featureSet.has('JAPANESE_STAFF');
      const hasJapaneseMenu = featureSet.has('JAPANESE_MENU');
      
      let cuisine = 'Khác';
      const cuisineFeature = features.find(f => f.startsWith('cuisine_'));
      if (cuisineFeature) {
        cuisine = cuisineFeature.replace('cuisine_', '');
      }

      const amenities: string[] = [];
      if (row.issuesVat || featureSet.has('VAT_INVOICE')) {
        amenities.push('vat');
      }
      if (featureSet.has('PARKING')) {
        amenities.push('parking');
      }
      if (featureSet.has('PRIVATE_ROOM')) {
        amenities.push('privateRoom');
      }

      return {
        id: Number(row.id),
        name: row.name,
        mapName: row.mapName,
        address: row.address,
        position: {
          lat: Number(row.lat),
          lng: Number(row.lng),
        },
        rating: Number(row.ratingValue).toFixed(1),
        ratingValue: Number(row.ratingValue),
        imageUrl: row.imageUrl || '',
        isVerified,
        hasJapaneseStaff,
        hasJapaneseMenu,
        cuisine,
        amenities,
        badges: [],
        features,
      };
    });
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

  private async resolveRouteTarget(
    restaurantId: number,
  ) {
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
}
