import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { DinerProfileDto } from './dto/diner-profile.dto';
import { LoginDto } from './dto/login.dto';
import { MerchantProfileDto } from './dto/merchant-profile.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './auth.types';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
        tokens: {
          accessToken: 'access.jwt.token',
          refreshToken: 'refresh.jwt.token',
        },
      },
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
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
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
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
  guest() {
    return this.authService.guestLogin();
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

  @Post('password/reset')
  @HttpCode(200)
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Reset password using token.',
    schema: {
      example: {
        message: 'Password updated successfully.',
      },
    },
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('profile/diner')
  @HttpCode(200)
  @ApiBody({ type: DinerProfileDto })
  @ApiOkResponse({
    description: 'Diner profile updated.',
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
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  completeDinerProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: DinerProfileDto,
  ) {
    return this.authService.completeDinerProfile(request.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('profile/merchant')
  @HttpCode(200)
  @ApiBody({ type: MerchantProfileDto })
  @ApiOkResponse({
    description: 'Merchant profile updated with restaurant.',
    schema: {
      example: {
        account: {
          accountId: 2,
          email: 'owner@example.com',
          role: 'Owner',
          status: 'Active',
        },
        ownerProfile: {
          accountId: 2,
          fullName: 'Tanaka Ken',
          phone: '+81-90-1234-5678',
          businessName: 'Sakura Sushi',
        },
        restaurant: {
          restaurantId: 10,
          ownerAccountId: 2,
          nameVn: 'Sakura Sushi',
          nameJp: 'Sakura Sushi JP',
          address: '1-2-3 Shibuya, Tokyo',
          phone: '+81-90-1234-5678',
          openingHours: '10:00-22:00',
          issuesVat: false,
          status: 'Draft',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  completeMerchantProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: MerchantProfileDto,
  ) {
    return this.authService.completeMerchantProfile(request.user.sub, dto);
  }
}
