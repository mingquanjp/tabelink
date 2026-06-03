import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import type { AuthTokens, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Account created with tokens.',
    schema: {
      example: {
        account: {
          accountId: 1,
          email: 'user@example.com',
          role: 'User',
          status: 'Active',
        },
        profile: {
          accountId: 1,
          fullName: 'Nguyen Van A',
          displayName: 'Foodie',
          dob: '12/31/1990',
          gender: 'Female',
          nationality: 'Japan',
          purpose: 'Diner',
        },
        tokens: {
          accessToken: 'access.jwt.token',
          refreshToken: 'refresh.jwt.token',
        },
      },
    },
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(response, result.tokens);
    return result;
  }

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login success with tokens.',
    schema: {
      example: {
        account: {
          accountId: 1,
          email: 'user@example.com',
          role: 'User',
          status: 'Active',
        },
        tokens: {
          accessToken: 'access.jwt.token',
          refreshToken: 'refresh.jwt.token',
        },
      },
    },
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(response, result.tokens, dto.rememberMe);
    return result;
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({
    description: 'Refresh tokens.',
    schema: {
      example: {
        account: {
          accountId: 1,
          email: 'user@example.com',
          role: 'User',
          status: 'Active',
        },
        tokens: {
          accessToken: 'access.jwt.token',
          refreshToken: 'refresh.jwt.token',
        },
      },
    },
  })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      dto.refreshToken ??
      this.getParsedCookies(request).refreshToken ??
      this.readCookie(request, 'refreshToken');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const result = await this.authService.refresh(refreshToken);
    this.setAuthCookies(response, result.tokens);
    return result;
  }

  @Post('guest')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Guest access without stored account.',
    schema: {
      example: {
        account: {
          accountId: 0,
          email: 'guest',
          role: 'Guest',
          status: 'Active',
        },
        tokens: {
          accessToken: 'access.jwt.token',
          refreshToken: 'refresh.jwt.token',
        },
        guest: true,
      },
    },
  })
  async guest(@Res({ passthrough: true }) response: Response) {
    const result = await this.authService.guestLogin();
    this.setAuthCookies(response, result.tokens);
    return result;
  }

  @Post('password/forgot')
  @HttpCode(200)
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiOkResponse({
    description: 'Request password reset link.',
    schema: {
      example: {
        message: 'If the account exists, a reset link has been sent.',
        resetToken: 'dev-only-reset-token',
      },
    },
  })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOkResponse({
    description: 'Current account profile status.',
    schema: {
      example: {
        account: {
          accountId: 1,
          email: 'user@example.com',
          role: 'User',
          status: 'Active',
        },
        profile: {
          accountId: 1,
          fullName: 'Nguyen Van A',
          displayName: 'Foodie',
          dob: '1990-12-31',
          gender: 'Female',
          nationality: 'Japan',
          purpose: 'Diner',
        },
        profileCompleted: true,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  getMe(@Req() request: AuthenticatedRequest) {
    return this.authService.getMe(request.user.sub);
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Clear authentication cookies.',
    schema: {
      example: { loggedOut: true },
    },
  })
  logout(@Res({ passthrough: true }) response: Response) {
    this.clearAuthCookies(response);
    return { loggedOut: true };
  }

  private setAuthCookies(
    response: Response,
    tokens: AuthTokens,
    rememberMe?: boolean,
  ) {
    const cookiePolicy = this.getCookiePolicy();
    const baseOptions: CookieOptions = {
      httpOnly: true,
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      path: '/',
    };

    response.cookie('accessToken', tokens.accessToken, {
      ...baseOptions,
      maxAge: 15 * 60 * 1000,
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      ...baseOptions,
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    });
    response.cookie('hasSession', 'true', {
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      path: '/',
      maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(response: Response) {
    const cookiePolicy = this.getCookiePolicy();
    const options: CookieOptions = {
      httpOnly: true,
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      path: '/',
    };

    response.clearCookie('accessToken', options);
    response.clearCookie('refreshToken', options);
    response.clearCookie('hasSession', {
      secure: cookiePolicy.secure,
      sameSite: cookiePolicy.sameSite,
      path: '/',
    });
  }

  private getCookiePolicy(): Pick<CookieOptions, 'sameSite' | 'secure'> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? '';
    const runsBehindHttpsFrontend = frontendUrl.startsWith('https://');
    const isProduction = process.env.NODE_ENV === 'production';
    const secure = isProduction || runsBehindHttpsFrontend;

    return {
      secure,
      sameSite: secure ? 'none' : 'lax',
    };
  }

  private readCookie(request: Request, name: string) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const target = cookies.find((cookie) => cookie.startsWith(`${name}=`));

    return target
      ? decodeURIComponent(target.slice(name.length + 1))
      : undefined;
  }

  private getParsedCookies(request: Request) {
    return (
      (
        request as Request & {
          cookies?: Record<string, string>;
        }
      ).cookies ?? {}
    );
  }
}
