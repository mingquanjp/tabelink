import {
  BadRequestException,
  BadGatewayException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MapsService } from './maps.service';

describe('MapsService', () => {
  let service: MapsService;
  let dataSource: { query: jest.Mock };
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  const user = {
    sub: 1,
    email: 'user@example.com',
    role: AuthRole.User,
  };

  const restaurantRow = {
    restaurantId: 10,
    nameVn: 'Bun Cha Sakura',
    nameJp: 'Bun Cha Sakura JP',
    address: '24 Hang Manh, Hoan Kiem, Hanoi',
    latitude: '21.02686000',
    longitude: '105.84647000',
  };

  beforeEach(async () => {
    dataSource = {
      query: jest.fn().mockResolvedValue([restaurantRow]),
    };
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [
          {
            distance: 1842.3,
            duration: 412.5,
            geometry: {
              coordinates: [
                [105.8412, 21.0166],
                [105.84647, 21.02686],
              ],
            },
          },
        ],
      }),
    } as unknown as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              if (key === 'OSRM_BASE_URL') {
                return 'https://osrm.test/';
              }

              if (key === 'OSRM_TIMEOUT_MS') {
                return '2500';
              }

              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MapsService>(MapsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns restaurant route coordinates, distance, and duration', async () => {
    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).resolves.toEqual({
      restaurantId: 10,
      origin: { lat: 21.0166, lng: 105.8412 },
      destination: {
        lat: 21.02686,
        lng: 105.84647,
        nameVn: 'Bun Cha Sakura',
        nameJp: 'Bun Cha Sakura JP',
        address: '24 Hang Manh, Hoan Kiem, Hanoi',
      },
      provider: 'osrm',
      distanceMeters: 1842.3,
      durationSeconds: 412.5,
      geometry: [
        { lat: 21.0166, lng: 105.8412 },
        { lat: 21.02686, lng: 105.84647 },
      ],
    });

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining("Status = 'Active'"),
      [10],
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://osrm.test/route/v1/driving/105.8412,21.0166;105.84647,21.02686?geometries=geojson&overview=full',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('reuses cached route responses for the same rounded origin', async () => {
    await service.getRestaurantRoute(
      10,
      { originLat: 21.0166, originLng: 105.8412 },
      user,
    );

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.01661, originLng: 105.84121 },
        user,
      ),
    ).resolves.toMatchObject({
      restaurantId: 10,
      origin: { lat: 21.01661, lng: 105.84121 },
      distanceMeters: 1842.3,
      durationSeconds: 412.5,
    });

    expect(dataSource.query).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid origin coordinates before requesting OSRM', async () => {
    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 91, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dataSource.query).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('allows guest users to request routes', async () => {
    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        { sub: 0, email: 'guest', role: AuthRole.Guest },
      ),
    ).resolves.toMatchObject({
      restaurantId: 10,
      provider: 'osrm',
    });
  });

  it('rejects owner and admin users', async () => {
    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        { sub: 2, email: 'owner@example.com', role: AuthRole.Owner },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws when active restaurant does not exist', async () => {
    dataSource.query.mockResolvedValueOnce([]);

    await expect(
      service.getRestaurantRoute(
        99,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when restaurant location is unavailable', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        ...restaurantRow,
        latitude: null,
      },
    ]);

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when restaurant coordinates are outside valid ranges', async () => {
    dataSource.query.mockResolvedValueOnce([
      {
        ...restaurantRow,
        latitude: '91.00000000',
      },
    ]);

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws when OSRM returns an HTTP error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as unknown as Response);

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('throws when OSRM response has no route geometry', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ routes: [{ distance: 100, duration: 30 }] }),
    } as unknown as Response);

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('throws when OSRM returns invalid route coordinates', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        routes: [
          {
            distance: 100,
            duration: 30,
            geometry: { coordinates: [[105.8412, 999]] },
          },
        ],
      }),
    } as unknown as Response);

    await expect(
      service.getRestaurantRoute(
        10,
        { originLat: 21.0166, originLng: 105.8412 },
        user,
      ),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });
});
