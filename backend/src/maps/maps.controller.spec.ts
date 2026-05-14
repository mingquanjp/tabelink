import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthRole } from '../auth/auth.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

describe('MapsController', () => {
  let app: INestApplication<App>;
  let mapsService: { getRestaurantRoute: jest.Mock };

  const routeResponse = {
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
  };

  beforeEach(async () => {
    mapsService = {
      getRestaurantRoute: jest.fn().mockResolvedValue(routeResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapsController],
      providers: [
        {
          provide: MapsService,
          useValue: mapsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = {
            sub: 1,
            email: 'user@example.com',
            role: AuthRole.User,
          };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('handles GET /maps/restaurants/:restaurantId/route', async () => {
    await request(app.getHttpServer())
      .get('/maps/restaurants/10/route')
      .query({
        originLat: '21.0166',
        originLng: '105.8412',
      })
      .expect(200)
      .expect(routeResponse);

    expect(mapsService.getRestaurantRoute).toHaveBeenCalledWith(
      10,
      {
        originLat: 21.0166,
        originLng: 105.8412,
      },
      {
        sub: 1,
        email: 'user@example.com',
        role: AuthRole.User,
      },
    );
  });
});
