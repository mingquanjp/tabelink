import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AccountStatus, AuthRole } from '../auth.constants';
import type { JwtPayload } from '../auth.types';
import { UserAccount } from '../entities/user-account.entity';

function extractAccessTokenFromCookie(request: Request) {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const accessTokenCookie = cookies.find((cookie) =>
    cookie.startsWith('accessToken='),
  );

  return accessTokenCookie
    ? decodeURIComponent(accessTokenCookie.slice('accessToken='.length))
    : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserAccount)
    private readonly userRepo: Repository<UserAccount>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAccessTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') ??
        configService.get<string>('JWT_SECRET') ??
        'dev_access_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.role === AuthRole.Guest || payload.sub === 0) {
      return payload;
    }

    const account = await this.userRepo.findOne({
      where: { accountId: payload.sub },
    });

    if (!account) {
      throw new UnauthorizedException('Account not found.');
    }

    if (
      account.status === AccountStatus.Banned ||
      account.status === AccountStatus.Disabled
    ) {
      throw new ForbiddenException('Account is not active.');
    }

    return {
      sub: account.accountId,
      email: account.email,
      role: account.role as unknown as AuthRole,
    };
  }
}
