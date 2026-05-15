import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserHomeService } from './user-home.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('user-home')
@Controller('user/home')
export class UserHomeController {
  constructor(private readonly userHomeService: UserHomeService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user home profile' })
  @ApiOkResponse({ description: 'Current user profile summary for ID3.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only customer users can view home profile.' })
  @ApiNotFoundResponse({ description: 'Customer profile was not found.' })
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.userHomeService.getProfile(request.user);
  }

  @Get('hot-restaurants')
  @ApiOperation({ summary: 'Get top 3 hot restaurants for home timeline' })
  @ApiOkResponse({ description: 'Hot restaurants ranked by positive visible reviews.' })
  getHotRestaurants() {
    return this.userHomeService.getHotRestaurants();
  }

  @Get('suggested-reviewers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get top 5 suggested reviewers' })
  @ApiOkResponse({ description: 'Suggested reviewers ranked by follower count.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Only customer users can view suggested reviewers.' })
  getSuggestedReviewers(@Req() request: AuthenticatedRequest) {
    return this.userHomeService.getSuggestedReviewers(request.user);
  }

  @Get('trending-topics')
  @ApiOperation({ summary: 'Get top 4 trending blog hashtags' })
  @ApiOkResponse({ description: 'Trending topics ranked by published blog usage.' })
  getTrendingTopics() {
    return this.userHomeService.getTrendingTopics();
  }

  @Get('advertised-restaurants')
  @ApiOperation({ summary: 'Get active advertised restaurants' })
  @ApiOkResponse({ description: 'Active advertisement restaurants for ID3 slider.' })
  getAdvertisedRestaurants() {
    return this.userHomeService.getAdvertisedRestaurants();
  }
}

@ApiTags('user-reviewers')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('user/reviewers')
export class UserReviewerController {
  constructor(private readonly userHomeService: UserHomeService) {}

  @Post(':accountId/follow')
  @ApiOperation({ summary: 'Follow a reviewer' })
  @ApiCreatedResponse({
    description: 'Reviewer followed.',
    schema: {
      example: {
        accountId: 5,
        isFollowing: true,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Only customer users can follow reviewers.' })
  @ApiNotFoundResponse({ description: 'Target reviewer was not found.' })
  followReviewer(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userHomeService.followReviewer(accountId, request.user);
  }

  @Delete(':accountId/follow')
  @ApiOperation({ summary: 'Unfollow a reviewer' })
  @ApiOkResponse({
    description: 'Reviewer unfollowed.',
    schema: {
      example: {
        accountId: 5,
        isFollowing: false,
      },
    },
  })
  @ApiForbiddenResponse({ description: 'Only customer users can unfollow reviewers.' })
  @ApiNotFoundResponse({ description: 'Target reviewer was not found.' })
  unfollowReviewer(
    @Param('accountId', ParseIntPipe) accountId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userHomeService.unfollowReviewer(accountId, request.user);
  }
}
