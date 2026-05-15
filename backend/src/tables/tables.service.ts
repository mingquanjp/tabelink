import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { ReservationSpecialRequest } from './entities/reservation-special-request.entity';
import {
  RestaurantTable,
  RestaurantTableStatus,
} from './entities/restaurant-table.entity';
import {
  SpecialRequestTemplate,
  SpecialRequestType,
} from './entities/special-request-template.entity';
import { CustomerProfile } from '../auth/entities/customer-profile.entity';
import { MailService } from '../mail/mail.service';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import {
  CreateReservationRequestDto,
  ReservationRequestType,
} from './dto/create-reservation-request.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateTableDto } from './dto/update-table.dto';

const ACTIVE_RESERVATION_STATUSES = [
  ReservationStatus.Pending,
  ReservationStatus.Confirmed,
  ReservationStatus.Arrived,
] as readonly ReservationStatus[];

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(RestaurantTable)
    private readonly tableRepo: Repository<RestaurantTable>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationSpecialRequest)
    private readonly reservationSpecialRequestRepo: Repository<ReservationSpecialRequest>,
    @InjectRepository(SpecialRequestTemplate)
    private readonly specialRequestTemplateRepo: Repository<SpecialRequestTemplate>,
    private readonly mailService: MailService,
  ) {}

  async listTables(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const tables = await this.tableRepo.find({
      where: { restaurantId },
      order: {
        zone: 'ASC',
        tableName: 'ASC',
        tableId: 'ASC',
      },
    });

    return {
      restaurantId,
      count: tables.length,
      summary: this.buildTableSummary(tables),
      tables: tables.map((table) => this.toTableResponse(table)),
    };
  }

  async createTable(
    restaurantId: number,
    dto: CreateTableDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const table = this.tableRepo.create({
      restaurantId,
      tableName: dto.tableName.trim(),
      capacity: dto.capacity,
      status: dto.status ?? RestaurantTableStatus.Empty,
      positionX: this.decimalValue(dto.positionX),
      positionY: this.decimalValue(dto.positionY),
      width: this.decimalValue(dto.width),
      height: this.decimalValue(dto.height),
      zone: this.optionalTrim(dto.zone),
    });

    try {
      const saved = await this.tableRepo.save(table);
      return this.toTableResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Table name already exists in this restaurant.',
        );
      }

      throw error;
    }
  }

  async updateTable(
    restaurantId: number,
    tableId: number,
    dto: UpdateTableDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const table = await this.findOwnedTable(restaurantId, tableId);

    if (dto.tableName !== undefined) {
      table.tableName = dto.tableName.trim();
    }

    if (dto.capacity !== undefined) {
      table.capacity = dto.capacity;
      await this.assertCapacityCanServeActiveReservations(table);
    }

    if (dto.status !== undefined) {
      table.status = dto.status;
    }

    if (dto.positionX !== undefined) {
      table.positionX = this.decimalValue(dto.positionX);
    }

    if (dto.positionY !== undefined) {
      table.positionY = this.decimalValue(dto.positionY);
    }

    if (dto.width !== undefined) {
      table.width = this.decimalValue(dto.width);
    }

    if (dto.height !== undefined) {
      table.height = this.decimalValue(dto.height);
    }

    if (dto.zone !== undefined) {
      table.zone = this.optionalTrim(dto.zone) ?? null;
    }

    try {
      const saved = await this.tableRepo.save(table);
      return this.toTableResponse(saved);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Table name already exists in this restaurant.',
        );
      }

      throw error;
    }
  }

  async updateTableStatus(
    restaurantId: number,
    tableId: number,
    status: RestaurantTableStatus,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const table = await this.findOwnedTable(restaurantId, tableId);

    if (status === RestaurantTableStatus.Empty) {
      const hasActiveReservation = await this.reservationRepo.exist({
        where: {
          restaurantId,
          tableId,
          status: In([...ACTIVE_RESERVATION_STATUSES]),
        },
      });

      if (hasActiveReservation) {
        throw new ConflictException('Table has active reservations.');
      }
    }

    table.status = status;
    const saved = await this.tableRepo.save(table);
    return this.toTableResponse(saved);
  }

  async removeTable(restaurantId: number, tableId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const table = await this.findOwnedTable(restaurantId, tableId);

    const hasReservation = await this.reservationRepo.exist({
      where: { restaurantId, tableId },
    });

    if (hasReservation) {
      throw new ConflictException(
        'Cannot delete a table that has reservations.',
      );
    }

    await this.tableRepo.remove(table);

    return {
      deleted: true,
      tableId,
      restaurantId,
    };
  }

  async createReservationRequest(
    restaurantId: number,
    dto: CreateReservationRequestDto,
    user: JwtPayload,
  ) {
    if (user.role !== AuthRole.User) {
      throw new ForbiddenException(
        'Only customer users can submit reservation requests.',
      );
    }

    const [restaurant, customer] = await Promise.all([
      this.findActiveRestaurantForBooking(restaurantId),
      this.customerRepo.findOne({ where: { accountId: user.sub } }),
    ]);

    if (!customer) {
      throw new NotFoundException('Customer profile was not found.');
    }

    const reservationDateTime = this.parseReservationDateTime(
      dto.reservationDate,
      dto.reservationTime,
    );

    if (reservationDateTime.getTime() <= Date.now()) {
      throw new BadRequestException('Reservation date time must be future.');
    }

    const customerName = this.requiredTrim(dto.customerName, 'customerName');
    const phoneNumber = this.requiredTrim(dto.phoneNumber, 'phoneNumber');
    const customRequest = this.optionalTrim(dto.customRequest) ?? null;
    await this.assertSpecialRequestTemplateIdsExist(dto.templateIds ?? []);

    const reservation = this.reservationRepo.create({
      customerAccountId: user.sub,
      restaurantId,
      reservationDateTime,
      durationMinutes: dto.durationMinutes ?? 120,
      pax: dto.pax,
      customerName,
      phoneNumber,
      note: customRequest,
      status: ReservationStatus.Pending,
    });

    const savedReservation = await this.reservationRepo.save(reservation);
    const specialRequests = await this.createSpecialRequests(
      savedReservation.reservationId,
      dto,
    );

    const ownerNotification = await this.notifyOwnerOfReservation({
      restaurant,
      reservation: savedReservation,
      customerName,
      phoneNumber,
      customRequest,
      specialRequestLabels: specialRequests.map((request) =>
        this.specialRequestLabel(request),
      ),
    });

    const refreshed = await this.reservationRepo.findOneOrFail({
      where: { reservationId: savedReservation.reservationId },
      relations: {
        customer: true,
        restaurant: true,
        specialRequests: { template: true },
      },
    });

    return {
      message: 'Reservation request submitted successfully.',
      ownerNotification,
      reservation: this.toReservationResponse(refreshed),
    };
  }

  async listReservations(
    restaurantId: number,
    query: ListReservationsQueryDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const where: {
      restaurantId: number;
      status?: ReservationStatus;
      reservationDateTime?: ReturnType<typeof Between<Date>>;
    } = { restaurantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      where.reservationDateTime = this.dateRange(query.date);
    }

    const reservations = await this.reservationRepo.find({
      where,
      relations: {
        table: true,
        customer: true,
        specialRequests: { template: true },
      },
      order: {
        reservationDateTime: 'ASC',
        reservationId: 'ASC',
      },
    });

    return {
      restaurantId,
      count: reservations.length,
      summary: this.buildReservationSummary(reservations),
      reservations: reservations.map((reservation) =>
        this.toReservationResponse(reservation),
      ),
    };
  }

  async findReservation(
    restaurantId: number,
    reservationId: number,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const reservation = await this.findOwnedReservation(
      restaurantId,
      reservationId,
    );

    return this.toReservationResponse(reservation);
  }

  async updateReservation(
    restaurantId: number,
    reservationId: number,
    dto: UpdateReservationDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const reservation = await this.findOwnedReservation(
      restaurantId,
      reservationId,
    );
    const previousTableId = reservation.tableId ?? null;
    const nextTableId = dto.tableId ?? reservation.tableId ?? null;

    if (dto.tableId !== undefined) {
      reservation.tableId = dto.tableId;
    }

    if (dto.durationMinutes !== undefined) {
      reservation.durationMinutes = dto.durationMinutes;
    }

    if (
      nextTableId &&
      (dto.tableId !== undefined || dto.durationMinutes !== undefined)
    ) {
      await this.assertTableCanBeAssigned(
        restaurantId,
        nextTableId,
        reservation,
      );
    }

    if (dto.status !== undefined) {
      reservation.status = dto.status;
    }

    if (dto.note !== undefined) {
      reservation.note = this.optionalTrim(dto.note) ?? null;
    }

    const saved = await this.reservationRepo.save(reservation);
    await this.syncReservationTableStatuses(
      restaurantId,
      saved,
      previousTableId,
    );

    const refreshed = await this.findOwnedReservation(
      restaurantId,
      reservationId,
    );
    return this.toReservationResponse(refreshed);
  }

  private async findActiveRestaurantForBooking(restaurantId: number) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { restaurantId, status: 'Active' },
      relations: {
        owner: { account: true },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Active restaurant was not found.');
    }

    return restaurant;
  }

  private parseReservationDateTime(date: string, time: string) {
    const value = new Date(`${date}T${time}:00+07:00`);

    if (Number.isNaN(value.getTime())) {
      throw new BadRequestException('Reservation date time is invalid.');
    }

    return value;
  }

  private async createSpecialRequests(
    reservationId: number,
    dto: CreateReservationRequestDto,
  ) {
    const templateIds = [...new Set(dto.templateIds ?? [])];
    const requestTypes = [...new Set(dto.requestTypes ?? [])];
    const requests: ReservationSpecialRequest[] = [];

    if (templateIds.length) {
      const templates = await this.specialRequestTemplateRepo.find({
        where: { templateId: In(templateIds) },
      });

      requests.push(
        ...templates.map((template) =>
          this.reservationSpecialRequestRepo.create({
            reservationId,
            templateId: template.templateId,
          }),
        ),
      );
    }

    const dbRequestTypes = requestTypes.filter(
      (type) => type !== ReservationRequestType.PrivateRoom,
    );

    if (dbRequestTypes.length) {
      const templates = await this.specialRequestTemplateRepo.find({
        where: { requestType: In(dbRequestTypes) },
        order: { templateId: 'ASC' },
      });

      const usedRequestTypes = new Set<string>();
      for (const type of dbRequestTypes) {
        const template = templates.find(
          (item) =>
            item.requestType === (type as unknown as SpecialRequestType) &&
            !usedRequestTypes.has(item.requestType),
        );

        if (template) {
          usedRequestTypes.add(template.requestType);
          requests.push(
            this.reservationSpecialRequestRepo.create({
              reservationId,
              templateId: template.templateId,
            }),
          );
        } else {
          requests.push(
            this.reservationSpecialRequestRepo.create({
              reservationId,
              customText: this.defaultSpecialRequestText(type),
            }),
          );
        }
      }
    }

    if (requestTypes.includes(ReservationRequestType.PrivateRoom)) {
      requests.push(
        this.reservationSpecialRequestRepo.create({
          reservationId,
          customText: this.defaultSpecialRequestText(
            ReservationRequestType.PrivateRoom,
          ),
        }),
      );
    }

    const customRequest = this.optionalTrim(dto.customRequest);
    if (customRequest) {
      requests.push(
        this.reservationSpecialRequestRepo.create({
          reservationId,
          customText: customRequest,
        }),
      );
    }

    if (!requests.length) {
      return [];
    }

    return this.reservationSpecialRequestRepo.save(requests);
  }

  private async assertSpecialRequestTemplateIdsExist(templateIds: number[]) {
    const uniqueTemplateIds = [...new Set(templateIds)];

    if (!uniqueTemplateIds.length) {
      return;
    }

    const count = await this.specialRequestTemplateRepo.count({
      where: { templateId: In(uniqueTemplateIds) },
    });

    if (count !== uniqueTemplateIds.length) {
      throw new BadRequestException(
        'Special request template selection contains unknown IDs.',
      );
    }
  }

  private defaultSpecialRequestText(type: ReservationRequestType) {
    const labels: Record<ReservationRequestType, string> = {
      [ReservationRequestType.Coriander]: 'No coriander / パクチー抜き',
      [ReservationRequestType.LessSpicy]: 'Less spicy / 辛さ控えめ',
      [ReservationRequestType.VATInvoice]: 'VAT invoice requested / 領収書・VAT希望',
      [ReservationRequestType.PrivateRoom]: 'Private room requested / 個室希望',
      [ReservationRequestType.Other]: 'Other special request',
    };

    return labels[type];
  }

  private async notifyOwnerOfReservation({
    restaurant,
    reservation,
    customerName,
    phoneNumber,
    customRequest,
    specialRequestLabels,
  }: {
    restaurant: Restaurant;
    reservation: Reservation;
    customerName: string;
    phoneNumber: string;
    customRequest: string | null;
    specialRequestLabels: string[];
  }) {
    const ownerEmail = restaurant.owner?.account?.email;

    if (!ownerEmail) {
      return { sent: false, reason: 'Owner email was not found.' };
    }

    try {
      await this.mailService.sendReservationRequestNotification({
        to: ownerEmail,
        restaurantName: restaurant.nameJp || restaurant.nameVn,
        customerName,
        phoneNumber,
        reservationDateTime: reservation.reservationDateTime,
        pax: reservation.pax,
        note: customRequest,
        specialRequests: specialRequestLabels,
        reservationId: reservation.reservationId,
      });

      return { sent: true };
    } catch (error) {
      this.logger.warn(
        `Failed to notify owner for reservation #${reservation.reservationId}`,
      );
      this.logger.warn(error);
      return { sent: false, reason: 'Owner notification failed.' };
    }
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException('Only restaurant owners can manage tables.');
    }

    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
        ownerAccountId: user.sub,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner.');
    }
  }

  private async findOwnedTable(restaurantId: number, tableId: number) {
    const table = await this.tableRepo.findOne({
      where: { restaurantId, tableId },
    });

    if (!table) {
      throw new NotFoundException('Table not found.');
    }

    return table;
  }

  private async findOwnedReservation(
    restaurantId: number,
    reservationId: number,
  ) {
    const reservation = await this.reservationRepo.findOne({
      where: { restaurantId, reservationId },
      relations: {
        table: true,
        customer: true,
        specialRequests: { template: true },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found.');
    }

    return reservation;
  }

  private async assertTableCanBeAssigned(
    restaurantId: number,
    tableId: number,
    reservation: Reservation,
  ) {
    const table = await this.findOwnedTable(restaurantId, tableId);

    if (table.capacity < reservation.pax) {
      throw new BadRequestException(
        'Table capacity is smaller than reservation pax.',
      );
    }

    const alreadyBooked = await this.hasOverlappingActiveReservation(
      restaurantId,
      tableId,
      reservation,
    );

    if (alreadyBooked) {
      throw new ConflictException(
        'Table already has an active reservation for this time.',
      );
    }
  }

  private async assertCapacityCanServeActiveReservations(
    table: RestaurantTable,
  ) {
    const oversizedReservation = await this.reservationRepo.findOne({
      where: {
        restaurantId: table.restaurantId,
        tableId: table.tableId,
        status: In([...ACTIVE_RESERVATION_STATUSES]),
      },
      order: {
        pax: 'DESC',
      },
    });

    if (oversizedReservation && oversizedReservation.pax > table.capacity) {
      throw new BadRequestException(
        'Table capacity is smaller than an active reservation pax.',
      );
    }
  }

  private async syncReservationTableStatuses(
    restaurantId: number,
    reservation: Reservation,
    previousTableId: number | null,
  ) {
    const currentTableId = reservation.tableId ?? null;

    if (currentTableId) {
      if (ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
        await this.tableRepo.update(
          { restaurantId, tableId: currentTableId },
          { status: RestaurantTableStatus.Reserved },
        );
      } else {
        await this.releaseTableIfNoActiveReservations(
          restaurantId,
          currentTableId,
        );
      }
    }

    if (previousTableId && previousTableId !== currentTableId) {
      await this.releaseTableIfNoActiveReservations(
        restaurantId,
        previousTableId,
      );
    }
  }

  private async releaseTableIfNoActiveReservations(
    restaurantId: number,
    tableId: number,
  ) {
    const hasActiveReservation = await this.reservationRepo.exist({
      where: {
        restaurantId,
        tableId,
        status: In([...ACTIVE_RESERVATION_STATUSES]),
      },
    });

    if (hasActiveReservation) {
      return;
    }

    const table = await this.findOwnedTable(restaurantId, tableId);
    if (table.status === RestaurantTableStatus.Reserved) {
      table.status = RestaurantTableStatus.Empty;
      await this.tableRepo.save(table);
    }
  }

  private dateRange(date: string) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    return Between(start, end);
  }

  private decimalValue(value?: number) {
    return value === undefined ? undefined : value.toFixed(2);
  }

  private requiredTrim(value: string, fieldName: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new BadRequestException(`${fieldName} must not be empty.`);
    }

    return trimmed;
  }

  private optionalTrim(value?: string) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }

  private buildTableSummary(tables: RestaurantTable[]) {
    return Object.values(RestaurantTableStatus).reduce(
      (summary, status) => ({
        ...summary,
        [status]: tables.filter((table) => table.status === status).length,
      }),
      {} as Record<RestaurantTableStatus, number>,
    );
  }

  private buildReservationSummary(reservations: Reservation[]) {
    return Object.values(ReservationStatus).reduce(
      (summary, status) => ({
        ...summary,
        [status]: reservations.filter(
          (reservation) => reservation.status === status,
        ).length,
      }),
      {} as Record<ReservationStatus, number>,
    );
  }

  private toTableResponse(table: RestaurantTable) {
    return {
      tableId: table.tableId,
      restaurantId: table.restaurantId,
      tableName: table.tableName,
      capacity: table.capacity,
      status: table.status,
      positionX:
        table.positionX === null || table.positionX === undefined
          ? null
          : Number(table.positionX),
      positionY:
        table.positionY === null || table.positionY === undefined
          ? null
          : Number(table.positionY),
      width:
        table.width === null || table.width === undefined
          ? null
          : Number(table.width),
      height:
        table.height === null || table.height === undefined
          ? null
          : Number(table.height),
      zone: table.zone ?? null,
    };
  }

  private toReservationResponse(reservation: Reservation) {
    return {
      reservationId: reservation.reservationId,
      restaurantId: reservation.restaurantId,
      customerAccountId: reservation.customerAccountId,
      customer: reservation.customer
        ? {
            accountId: reservation.customer.accountId,
            fullName: reservation.customer.fullName,
            displayName: reservation.customer.displayName ?? null,
            avatarUrl: reservation.customer.avatarUrl ?? null,
          }
        : null,
      tableId: reservation.tableId ?? null,
      table: reservation.table ? this.toTableResponse(reservation.table) : null,
      reservationDateTime: reservation.reservationDateTime,
      durationMinutes: reservation.durationMinutes,
      reservationEndDateTime: this.reservationEndDateTime(reservation),
      pax: reservation.pax,
      customerName: reservation.customerName ?? null,
      phoneNumber: reservation.phoneNumber ?? null,
      note: reservation.note ?? null,
      specialRequests: (reservation.specialRequests ?? []).map((request) =>
        this.toSpecialRequestResponse(request),
      ),
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }

  private toSpecialRequestResponse(request: ReservationSpecialRequest) {
    return {
      requestId: request.requestId,
      templateId: request.templateId ?? null,
      requestType: request.template?.requestType ?? null,
      textVn: request.template?.textVn ?? null,
      textJp: request.template?.textJp ?? null,
      customText: request.customText ?? null,
      label: this.specialRequestLabel(request),
    };
  }

  private specialRequestLabel(request: ReservationSpecialRequest) {
    return (
      request.template?.textJp ??
      request.template?.textVn ??
      request.customText ??
      'Special request'
    );
  }

  private async hasOverlappingActiveReservation(
    restaurantId: number,
    tableId: number,
    reservation: Reservation,
  ) {
    const start = reservation.reservationDateTime;
    const durationMinutes = reservation.durationMinutes || 120;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return this.reservationRepo
      .createQueryBuilder('reservation')
      .where('reservation.restaurantid = :restaurantId', { restaurantId })
      .andWhere('reservation.tableid = :tableId', { tableId })
      .andWhere('reservation.reservationid <> :reservationId', {
        reservationId: reservation.reservationId,
      })
      .andWhere('reservation.status IN (:...statuses)', {
        statuses: ACTIVE_RESERVATION_STATUSES,
      })
      .andWhere('reservation.reservationdatetime < :end', { end })
      .andWhere(
        "reservation.reservationdatetime + (reservation.durationminutes * INTERVAL '1 minute') > :start",
        { start },
      )
      .getExists();
  }

  private reservationEndDateTime(reservation: Reservation) {
    const durationMinutes = reservation.durationMinutes || 120;
    return new Date(
      reservation.reservationDateTime.getTime() + durationMinutes * 60 * 1000,
    );
  }
}
