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
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
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
      'Backend Feature ID 12 / screen ID6 for customer booking. Creates a pending reservation, stores template/custom special requests, and notifies the restaurant owner by email.',
  })
  @ApiCreatedResponse({
    description: 'Reservation request submitted.',
    schema: {
      example: {
        message: 'Reservation request submitted successfully.',
        ownerNotification: { sent: true },
        reservation: {
          reservationId: 100,
          restaurantId: 1,
          customerAccountId: 20,
          tableId: null,
          reservationDateTime: '2026-05-20T12:00:00.000Z',
          durationMinutes: 120,
          reservationEndDateTime: '2026-05-20T14:00:00.000Z',
          pax: 2,
          customerName: 'Tanaka Taro',
          phoneNumber: '090-1234-5678',
          note: 'Window seat if available.',
          specialRequests: [
            {
              requestId: 1,
              templateId: 1,
              requestType: 'Coriander',
              textVn: 'Khong rau mui',
              textJp: 'パクチー抜き',
              customText: null,
              label: 'パクチー抜き',
            },
          ],
          status: 'Pending',
        },
      },
    },
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
