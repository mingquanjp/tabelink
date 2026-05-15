import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateReservationRequestDto,
  CreateReservationRequestResponseDto,
  ReservationRequestType,
} from './dto/create-reservation-request.dto';
import { TablesService } from './tables.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@ApiTags('reservations')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
@UseGuards(JwtAuthGuard)
@Controller('restaurants/:restaurantId/reservations')
export class UserReservationsController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit a customer reservation request',
    description:
      'Backend Feature ID 12 / screen ID6 for customer booking. Creates a pending reservation, stores Japanese template/custom special requests, and notifies the restaurant owner by email.',
  })
  @ApiBody({
    type: CreateReservationRequestDto,
    examples: {
      screenId6: {
        summary: 'Screen ID6 booking request',
        value: {
          customerName: 'Tanaka Taro',
          phoneNumber: '090-1234-5678',
          reservationDate: '2026-05-20',
          reservationTime: '19:00',
          pax: 2,
          durationMinutes: 120,
          requestTypes: [
            ReservationRequestType.Coriander,
            ReservationRequestType.LessSpicy,
            ReservationRequestType.VATInvoice,
          ],
          customRequest: 'Window seat if available.',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Reservation request submitted.',
    type: CreateReservationRequestResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid reservation date/time or special request selection.',
  })
  @ApiForbiddenResponse({
    description: 'Only customer users can submit reservation requests.',
  })
  @ApiNotFoundResponse({
    description: 'Active restaurant or customer profile was not found.',
  })
  createReservationRequest(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() dto: CreateReservationRequestDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tablesService.createReservationRequest(
      restaurantId,
      dto,
      request.user,
    );
  }
}
