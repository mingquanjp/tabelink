import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
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
import { RestaurantTableStatus } from '../entities/restaurant-table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('tables')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@ApiForbiddenResponse({ description: 'Only restaurant owners can manage tables.' })
@UseGuards(JwtAuthGuard)
@Controller('owner/restaurants/:restaurantId')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get('tables')
  @ApiOperation({
    summary: 'List restaurant tables',
    description:
      'Returns table layout data and table status summary for screen ID12 table management.',
  })
  @ApiOkResponse({
    description: 'Restaurant tables for the owner.',
    schema: {
      example: {
        restaurantId: 1,
        count: 2,
        summary: { Empty: 1, Using: 0, Reserved: 1, OutOfService: 0 },
        tables: [
          {
            tableId: 1,
            restaurantId: 1,
            tableName: 'A1',
            capacity: 4,
            status: 'Reserved',
            positionX: 120,
            positionY: 80,
            width: 90,
            height: 90,
            zone: 'Floor 1',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Restaurant not found for this owner.' })
  listTables(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.listTables(restaurantId, request.user);
  }

  @Post('tables')
  @ApiOperation({
    summary: 'Create restaurant table',
    description:
      'Creates one table/seat area for screen ID12. Table names are unique per restaurant.',
  })
  @ApiCreatedResponse({ description: 'Table created.' })
  @ApiConflictResponse({ description: 'Table name already exists.' })
  createTable(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateTableDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.createTable(restaurantId, dto, request.user);
  }

  @Patch('tables/:tableId')
  @ApiOperation({
    summary: 'Update restaurant table',
    description:
      'Updates table name, capacity, layout position, zone, or status for screen ID12.',
  })
  @ApiOkResponse({ description: 'Table updated.' })
  @ApiNotFoundResponse({ description: 'Restaurant or table not found.' })
  @ApiConflictResponse({ description: 'Table name already exists.' })
  updateTable(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Body() dto: UpdateTableDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.updateTable(
      restaurantId,
      tableId,
      dto,
      request.user,
    );
  }

  @Patch('tables/:tableId/status')
  @ApiOperation({
    summary: 'Update table status',
    description:
      'Quick status update for screen ID12. Sending Empty is blocked while active reservations exist.',
  })
  @ApiBody({
    type: UpdateTableStatusDto,
    examples: {
      using: { value: { status: RestaurantTableStatus.Using } },
      outOfService: { value: { status: RestaurantTableStatus.OutOfService } },
    },
  })
  @ApiOkResponse({ description: 'Table status updated.' })
  @ApiConflictResponse({ description: 'Table has active reservations.' })
  updateTableStatus(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Body() dto: UpdateTableStatusDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.updateTableStatus(
      restaurantId,
      tableId,
      dto.status,
      request.user,
    );
  }

  @Delete('tables/:tableId')
  @ApiOperation({
    summary: 'Delete restaurant table',
    description:
      'Deletes a table only when no reservations reference it, preserving reservation history.',
  })
  @ApiOkResponse({ description: 'Table deleted.' })
  @ApiConflictResponse({ description: 'Table has reservations.' })
  removeTable(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.removeTable(restaurantId, tableId, request.user);
  }

  @Get('reservations')
  @ApiOperation({
    summary: 'List restaurant reservations',
    description:
      'Returns reservations with customer and assigned table data for screen ID12 reservation management. Optional filters: date and status.',
  })
  @ApiOkResponse({ description: 'Restaurant reservations for the owner.' })
  listReservations(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query() query: ListReservationsQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.listReservations(restaurantId, query, request.user);
  }

  @Get('reservations/:reservationId')
  @ApiOperation({
    summary: 'Get reservation detail',
    description: 'Returns one reservation with customer and table information.',
  })
  @ApiOkResponse({ description: 'Reservation detail.' })
  @ApiNotFoundResponse({ description: 'Restaurant or reservation not found.' })
  findReservation(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.findReservation(
      restaurantId,
      reservationId,
      request.user,
    );
  }

  @Patch('reservations/:reservationId')
  @ApiOperation({
    summary: 'Update reservation status or assigned table',
    description:
      'Approves, rejects, cancels, completes, marks no-show, edits note, or assigns a table. Assigning a table validates ownership, capacity, out-of-service state, and active time-slot conflicts.',
  })
  @ApiOkResponse({ description: 'Reservation updated.' })
  @ApiConflictResponse({ description: 'Assigned table already has an active reservation.' })
  updateReservation(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: UpdateReservationDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.updateReservation(
      restaurantId,
      reservationId,
      dto,
      request.user,
    );
  }
}
