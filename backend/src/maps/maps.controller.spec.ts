import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';

describe('MapsController', () => {
  let controller: MapsController;
  let mapsService: { getRestaurantRoute: jest.Mock };

  const user: JwtPayload = {
    sub: 1,
    email: 'user@example.com',
    role: AuthRole.User,
  };

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

  beforeEach(() => {
    mapsService = {
      getRestaurantRoute: jest.fn().mockResolvedValue(routeResponse),
    };

    controller = new MapsController(mapsService as unknown as MapsService);
  });

  it('handles GET /maps/restaurants/:restaurantId/route', async () => {
    await expect(
      controller.getRestaurantRoute(
        10,
        {
          originLat: 21.0166,
          originLng: 105.8412,
        },
        { user } as never,
      ),
    ).resolves.toEqual(routeResponse);

    expect(mapsService.getRestaurantRoute).toHaveBeenCalledWith(
      10,
      {
        originLat: 21.0166,
        originLng: 105.8412,
      },
      user,
    );
  });
});
