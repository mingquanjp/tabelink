import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
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
import { AuthRole } from '../auth/auth.constants';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { FeedService } from './feed.service';

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@ApiTags('user-feed')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only customer users can use feed APIs.' })
@Controller('user')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  private getGuestAwareUser(request: AuthenticatedRequest): JwtPayload {
    return request.user ?? { sub: 0, email: 'guest', role: AuthRole.Guest };
  }

  @Get('feed')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get ID3 timeline feed posts' })
  @ApiOkResponse({
    description: 'Paginated published blog posts for timeline.',
  })
  getFeed(@Query() query: FeedQueryDto, @Req() request: AuthenticatedRequest) {
    return this.feedService.getFeed(query, this.getGuestAwareUser(request));
  }

  @Get('posts/:blogId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get timeline post detail popup data' })
  @ApiOkResponse({
    description: 'Published blog post detail with initial comments.',
  })
  @ApiNotFoundResponse({ description: 'Published blog post was not found.' })
  getPostDetail(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feedService.getPostDetail(
      blogId,
      this.getGuestAwareUser(request),
    );
  }

  @Post('posts/:blogId/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like a timeline post' })
  @ApiCreatedResponse({
    description: 'Post liked.',
    schema: { example: { blogId: 100, isLiked: true } },
  })
  @ApiNotFoundResponse({ description: 'Published blog post was not found.' })
  likePost(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feedService.likePost(blogId, request.user!);
  }

  @Delete('posts/:blogId/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unlike a timeline post' })
  @ApiOkResponse({
    description: 'Post unliked.',
    schema: { example: { blogId: 100, isLiked: false } },
  })
  @ApiNotFoundResponse({ description: 'Published blog post was not found.' })
  unlikePost(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feedService.unlikePost(blogId, request.user!);
  }

  @Get('posts/:blogId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get timeline post comments' })
  @ApiOkResponse({ description: 'Paginated visible comments for a post.' })
  @ApiNotFoundResponse({ description: 'Published blog post was not found.' })
  getComments(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Query() query: CommentQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feedService.getComments(
      blogId,
      query,
      this.getGuestAwareUser(request),
    );
  }

  @Post('posts/:blogId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a timeline post comment' })
  @ApiCreatedResponse({ description: 'Comment created.' })
  @ApiNotFoundResponse({ description: 'Published blog post was not found.' })
  createComment(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() dto: CreateCommentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.feedService.createComment(blogId, dto, request.user!);
  }
}
