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
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenusService } from './menus.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('menus')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only restaurant owners can manage menus.' })
@UseGuards(JwtAuthGuard)
@Controller('owner/restaurants/:restaurantId/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

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
            spicyLevel: 1,
            corianderLevel: 2,
            criteria: [
              {
                criterionId: 1,
                criterionName: 'Mui huong',
                ratingLevel: 4,
                sortOrder: 0,
              },
            ],
            imageUrl: 'https://example.com/menu/pho-bo.jpg',
            isActive: true,
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
        spicyLevel: 1,
        corianderLevel: 2,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        isActive: true,
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
        spicyLevel: 1,
        corianderLevel: 2,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        isActive: true,
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

  @Patch(':itemId')
  @ApiOperation({
    summary: 'Update menu item',
    description:
      'Updates menu item fields. To mark out of stock, send `{ "isActive": false }`; to reopen sales, send `{ "isActive": true }`.',
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
        spicyLevel: 1,
        corianderLevel: 2,
        criteria: [
          {
            criterionId: 1,
            criterionName: 'Mui huong',
            ratingLevel: 4,
            sortOrder: 0,
          },
        ],
        imageUrl: 'https://example.com/menu/pho-bo.jpg',
        isActive: true,
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

  @Delete(':itemId')
  @ApiOperation({
    summary: 'Delete menu item',
    description: 'Deletes a menu item from an owner restaurant.',
  })
  @ApiOkResponse({
    description: 'Delete a menu item.',
    schema: {
      example: {
        deleted: true,
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
