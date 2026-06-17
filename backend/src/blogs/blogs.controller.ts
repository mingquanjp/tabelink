import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogMediaService } from './blog-media.service';
import { UploadedBlogMediaFile } from './blog-media-upload.types';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { ListBlogTagsQueryDto } from './dto/list-blog-tags-query.dto';
import { SearchRestaurantOptionsQueryDto } from './dto/search-restaurant-options-query.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('blogs')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller()
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogMediaService: BlogMediaService,
  ) {}

  @Get('blogs/restaurants/search')
  @ApiOperation({
    summary: 'Search restaurants for blog linking',
    description:
      'Returns restaurant autocomplete suggestions for screen ID7 restaurant linking. The selected restaurantId is then used in POST /restaurants/:restaurantId/blogs.',
  })
  @ApiOkResponse({
    description: 'Restaurant suggestions for ID7 linking.',
  })
  searchRestaurants(@Query() query: SearchRestaurantOptionsQueryDto) {
    return this.blogsService.searchRestaurantOptions(query);
  }

  @Get('blogs/tags')
  @ApiOperation({
    summary: 'List blog tags',
    description:
      'Returns existing hashtag suggestions for screen ID7 tag selection.',
  })
  @ApiOkResponse({ description: 'Blog tag suggestions.' })
  listTags(@Query() query: ListBlogTagsQueryDto) {
    return this.blogsService.listTags(query);
  }

  @Post('blogs/tags')
  @ApiOperation({
    summary: 'Create a blog tag',
    description:
      'Creates a new hashtag for screen ID7 + tag action. Existing names are returned without duplication.',
  })
  @ApiCreatedResponse({
    description: 'Blog tag created or reused.',
    schema: {
      example: {
        tagId: 1,
        name: 'hanoidining',
        created: true,
      },
    },
  })
  createTag(
    @Body() dto: CreateBlogTagDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blogsService.createTag(dto, request.user);
  }

  @Post('restaurants/:restaurantId/blogs/media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload blog media',
    description:
      'Uploads one photo or video for screen ID7 blog posting. Use the returned mediaUrl and mediaType in POST /restaurants/:restaurantId/blogs.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'JPG, PNG, WEBP, MP4, MOV, or WEBM. Images max 20MB; videos have no app-level size limit.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Blog media uploaded to Cloudinary.',
  })
  @ApiForbiddenResponse({
    description: 'Only customer users can upload blog media.',
  })
  @ApiNotFoundResponse({ description: 'Active restaurant not found.' })
  uploadBlogMedia(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @UploadedFile() file: UploadedBlogMediaFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blogMediaService.upload(restaurantId, file, request.user);
  }

  @Post('restaurants/:restaurantId/blogs')
  @ApiOperation({
    summary: 'Create a restaurant-linked blog post',
    description:
      'Creates a published BLOG_POST for screen ID7, with media and selected hashtag links.',
  })
  @ApiCreatedResponse({
    description: 'Blog post created.',
    schema: {
      example: {
        blogId: 100,
        customerAccountId: 40,
        restaurantId: 1,
        title: 'Một bữa tối ở Hà Nội',
        content: 'Quán có không khí dễ chịu, món ăn hợp khẩu vị.',
        tasteRating: 5,
        hygieneRating: 4,
        serviceRating: 5,
        status: 'Published',
        media: [
          {
            mediaId: 1,
            mediaUrl: 'https://example.com/blogs/100/photo.jpg',
            mediaType: 'Photo',
            sortOrder: 0,
          },
        ],
        tags: [
          {
            tagId: 1,
            name: 'hanoidining',
          },
        ],
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Only customer users can create blog posts.',
  })
  @ApiNotFoundResponse({
    description: 'Active restaurant or customer profile was not found.',
  })
  createBlog(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateBlogDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blogsService.createBlog(restaurantId, dto, request.user);
  }

  @Delete('blogs/:blogId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a blog post owned by the current user',
    description:
      'Soft-deletes a BLOG_POST by marking it as Deleted. Only the customer who created the blog can delete it.',
  })
  @ApiNoContentResponse({ description: 'Blog post deleted.' })
  @ApiForbiddenResponse({
    description: 'Only customer users can delete their own blog posts.',
  })
  @ApiNotFoundResponse({ description: 'Published blog post not found.' })
  deleteBlog(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.blogsService.deleteBlog(blogId, request.user);
  }
}
