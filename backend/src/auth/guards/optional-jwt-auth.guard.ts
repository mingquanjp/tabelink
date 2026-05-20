import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_STRATEGY } from '../auth.constants';
import type { JwtPayload } from '../auth.types';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard(AUTH_STRATEGY.jwt) {
  handleRequest<TUser = JwtPayload | undefined>(_error: unknown, user: TUser) {
    return user ?? undefined;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
