import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { DeleteMenuImageDto } from './dto/delete-menu-image.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuImagesService } from './menu-images.service';
import { UploadedMenuImageFile } from './menu-image-upload.types';
import { MenusService } from './menus.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('menus')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({
  description: 'Only restaurant owners can manage menus.',
})
@UseGuards(JwtAuthGuard)
@Controller('owner/restaurants/:restaurantId/menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly menuImagesService: MenuImagesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List owner restaurant menu items',
    description:
      'Returns all menu items for a restaurant owned by the authenticated owner. Used by screen ID11 menu card list.',
  })
  @ApiOkResponse({
    description: 'List menu items for an owner restaurant.',
    schema: {
      example: {
        restaurantId: 1,
        count: 1,
        items: [
          {
            itemId: 10,
            restaurantId: 1,
            nameVn: 'Pho bo',
            nameJp: '牛肉フォー',
            price: 85000,
            descriptionVn: 'Pho bo voi nuoc dung thanh.',
            descriptionJp: 'あっさりした牛肉フォーです。',
            ingredients: 'Banh pho\nThit bo\nHanh tay\nRau thom',
            isRecommendedForJp: true,
            criteria: [
              {
                criterionId: 1,
                criterionName: 'Mui huong',
                ratingLevel: 4,
                sortOrder: 0,
              },
            ],
            imageUrl: 'https://example.com/menu/pho-bo.jpg',
            imagePublicId: 'tabelink/restaurants/1/menus/pho-bo',
            isActive: true,
            deletedAt: null,
            createdAt: '2026-05-07T10:00:00.000Z',
            updatedAt: '2026-05-07T10:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  list(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.list(restaurantId, request.user);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'List owner menu categories',
    description:
      'Returns active menu categories for the owner menu category tabs.',
  })
  @ApiOkResponse({ description: 'List active menu categories.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  listCategories(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.listCategories(restaurantId, request.user);
  }

  @Post('categories')
  @ApiOperation({
    summary: 'Create owner menu category',
    description:
      'Creates a category used by owner menu tabs and owner home recommended menu tabs.',
  })
  @ApiCreatedResponse({ description: 'Created menu category.' })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  createCategory(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateMenuCategoryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.createCategory(restaurantId, dto, request.user);
  }

  @Delete('categories/:categoryId')
  @ApiOperation({
    summary: 'Delete owner menu category',
    description:
      'Soft deletes an active menu category and all menu items inside it.',
  })
  @ApiOkResponse({ description: 'Deleted menu category.' })
  @ApiNotFoundResponse({ description: 'Restaurant or category not found.' })
  removeCategory(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.removeCategory(
      restaurantId,
      categoryId,
      request.user,
    );
  }

  @Get(':itemId')
  @ApiOperation({
    summary: 'Get one menu item',
    description:
      'Returns one menu item detail for screen ID11 right-side edit form.',
  })
  @ApiOkResponse({
    description: 'Get one menu item.',
    schema: {
      example: {
        itemId: 10,
        restaurantId: 1,
        nameVn: 'Pho bo',
        nameJp: '牛肉フォー',
        price: 85000,
        descriptionVn: 'Pho bo voi nuoc dung thanh.',
        descriptionJp: 'あっさりした牛肉フォーです。',
        ingredients: 'Banh pho\nThit bo\nHanh tay\nRau thom',
        isRecommendedForJp: true,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        imagePublicId: 'tabelink/restaurants/1/menus/pho-bo',
        isActive: true,
        deletedAt: null,
        createdAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant or menu item not found.' })
  findOne(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.findOne(restaurantId, itemId, request.user);
  }

  @Post()
  @ApiOperation({
    summary: 'Create menu item',
    description:
      'Creates a new menu item for an owner restaurant. The ingredients field maps to ID11 材料入力欄 / Ô nhập Nguyên liệu.',
  })
  @ApiCreatedResponse({
    description: 'Create a menu item.',
    schema: {
      example: {
        itemId: 10,
        restaurantId: 1,
        nameVn: 'Pho bo',
        nameJp: '牛肉フォー',
        price: 85000,
        descriptionVn: 'Pho bo voi nuoc dung thanh.',
        descriptionJp: 'あっさりした牛肉フォーです。',
        ingredients: 'Banh pho\nThit bo\nHanh tay\nRau thom',
        isRecommendedForJp: true,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        imagePublicId: 'tabelink/restaurants/1/menus/pho-bo',
        isActive: true,
        deletedAt: null,
        createdAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:00:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  create(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateMenuItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.create(restaurantId, dto, request.user);
  }

  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload menu image',
    description:
      'Uploads one menu image to Cloudinary for ID11 image upload area. Use the returned imageUrl when creating or updating a menu item.',
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
          description: 'JPG, PNG, or WEBP image. Max 10MB.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Image uploaded to Cloudinary.',
    schema: {
      example: {
        imageUrl:
          'https://res.cloudinary.com/demo/image/upload/v123/tabelink/restaurants/1/menus/pho-bo.jpg',
        publicId: 'tabelink/restaurants/1/menus/pho-bo',
        width: 1200,
        height: 800,
        bytes: 245678,
        format: 'jpg',
        originalName: 'pho-bo.jpg',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  uploadImage(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @UploadedFile() file: UploadedMenuImageFile | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menuImagesService.upload(restaurantId, file, request.user);
  }

  @Delete('images')
  @ApiOperation({
    summary: 'Delete uploaded menu image',
    description:
      'Deletes an uploaded menu image by Cloudinary publicId. Use this for images uploaded while creating a menu item before the item is saved.',
  })
  @ApiBody({ type: DeleteMenuImageDto })
  @ApiOkResponse({
    description: 'Uploaded image deleted from Cloudinary.',
    schema: {
      example: {
        deleted: true,
        cloudinaryDeleted: true,
        publicId: 'tabelink/restaurants/1/menus/pho-bo',
        restaurantId: 1,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  deleteUploadedImage(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: DeleteMenuImageDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menuImagesService.deleteUploaded(
      restaurantId,
      dto,
      request.user,
    );
  }

  @Patch(':itemId')
  @ApiOperation({
    summary: 'Update menu item',
    description:
      'Updates menu item fields. To mark out of stock, send `{ "isActive": false }`; to reopen sales, send `{ "isActive": true }`. To replace an uploaded image, send both `imageUrl` and `imagePublicId` from the upload API.',
  })
  @ApiOkResponse({
    description: 'Update a menu item.',
    schema: {
      example: {
        itemId: 10,
        restaurantId: 1,
        nameVn: 'Pho bo dac biet',
        nameJp: '特製牛肉フォー',
        price: 95000,
        descriptionVn: 'Pho bo dac biet voi topping them.',
        descriptionJp: '具材を追加した特製牛肉フォーです。',
        ingredients: 'Banh pho\nThit bo\nHanh tay\nRau thom',
        isRecommendedForJp: true,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        imagePublicId: 'tabelink/restaurants/1/menus/pho-bo',
        isActive: true,
        deletedAt: null,
        createdAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:05:00.000Z',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant or menu item not found.' })
  update(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateMenuItemDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.update(restaurantId, itemId, dto, request.user);
  }

  @Delete(':itemId/image')
  @ApiOperation({
    summary: 'Delete menu item image',
    description:
      'Deletes only the uploaded image for a menu item and clears imageUrl/imagePublicId. The menu item remains active and is not soft deleted.',
  })
  @ApiOkResponse({
    description: 'Delete only a menu item image.',
    schema: {
      example: {
        deleted: true,
        imageDetached: true,
        cloudinaryDeleted: true,
        itemId: 10,
        restaurantId: 1,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant or menu item not found.' })
  removeImage(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.removeImage(restaurantId, itemId, request.user);
  }

  @Delete(':itemId')
  @ApiOperation({
    summary: 'Delete menu item',
    description:
      'Soft deletes a menu item from an owner restaurant. If imagePublicId is stored, the Cloudinary image is deleted too.',
  })
  @ApiOkResponse({
    description: 'Delete a menu item.',
    schema: {
      example: {
        deleted: true,
        softDeleted: true,
        cloudinaryDeleted: true,
        itemId: 10,
        restaurantId: 1,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant or menu item not found.' })
  remove(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.menusService.remove(restaurantId, itemId, request.user);
  }
}
