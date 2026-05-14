import { AuthRole } from './auth.constants';

export interface JwtPayload {
  sub: number;
  email: string;
  role: AuthRole;
}

export interface AuthRestaurantContext {
  restaurantId: number;
  ownerAccountId: number;
  nameVn: string;
  nameJp: string;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
