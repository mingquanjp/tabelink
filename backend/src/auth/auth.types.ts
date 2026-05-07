import { AuthRole } from './auth.constants';

export interface JwtPayload {
  sub: number;
  email: string;
  role: AuthRole;
}
