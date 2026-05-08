import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import {
  Reservation,
  ReservationStatus,
} from '../entities/reservation.entity';
import {
  RestaurantTable,
  RestaurantTableStatus,
} from '../entities/restaurant-table.entity';
import { Restaurant } from '../entities/restaurant.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { ListReservationsQueryDto } from './dto/list-reservations-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateTableDto } from './dto/update-table.dto';

const ACTIVE_RESERVATION_STATUSES = [
  ReservationStatus.Pending,
  ReservationStatus.Approved,
] as readonly ReservationStatus[];

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(RestaurantTable)
    private readonly tableRepo: Repository<RestaurantTable>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
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

  async createTable(restaurantId: number, dto: CreateTableDto, user: JwtPayload) {
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
        throw new ConflictException('Table name already exists in this restaurant.');
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
        throw new ConflictException('Table name already exists in this restaurant.');
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
      throw new ConflictException('Cannot delete a table that has reservations.');
    }

    await this.tableRepo.remove(table);

    return {
      deleted: true,
      tableId,
      restaurantId,
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
    const reservation = await this.findOwnedReservation(restaurantId, reservationId);

    return this.toReservationResponse(reservation);
  }

  async updateReservation(
    restaurantId: number,
    reservationId: number,
    dto: UpdateReservationDto,
    user: JwtPayload,
  ) {
    await this.assertOwnerRestaurant(restaurantId, user);
    const reservation = await this.findOwnedReservation(restaurantId, reservationId);
    const previousTableId = reservation.tableId ?? null;

    if (dto.tableId !== undefined) {
      await this.assertTableCanBeAssigned(restaurantId, dto.tableId, reservation);
      reservation.tableId = dto.tableId;
    }

    if (dto.status !== undefined) {
      reservation.status = dto.status;
    }

    if (dto.note !== undefined) {
      reservation.note = this.optionalTrim(dto.note) ?? null;
    }

    const saved = await this.reservationRepo.save(reservation);
    await this.syncReservationTableStatuses(restaurantId, saved, previousTableId);

    const refreshed = await this.findOwnedReservation(restaurantId, reservationId);
    return this.toReservationResponse(refreshed);
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

  private async findOwnedReservation(restaurantId: number, reservationId: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { restaurantId, reservationId },
      relations: {
        table: true,
        customer: true,
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

    if (table.status === RestaurantTableStatus.OutOfService) {
      throw new BadRequestException('Cannot assign an out-of-service table.');
    }

    if (table.capacity < reservation.pax) {
      throw new BadRequestException('Table capacity is smaller than reservation pax.');
    }

    const alreadyBooked = await this.reservationRepo.exist({
      where: {
        restaurantId,
        tableId,
        reservationDateTime: reservation.reservationDateTime,
        status: In([...ACTIVE_RESERVATION_STATUSES]),
        reservationId: Not(reservation.reservationId),
      },
    });

    if (alreadyBooked) {
      throw new ConflictException('Table already has an active reservation for this time.');
    }
  }

  private async assertCapacityCanServeActiveReservations(table: RestaurantTable) {
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
        await this.releaseTableIfNoActiveReservations(restaurantId, currentTableId);
      }
    }

    if (previousTableId && previousTableId !== currentTableId) {
      await this.releaseTableIfNoActiveReservations(restaurantId, previousTableId);
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
      positionX: table.positionX === null || table.positionX === undefined
        ? null
        : Number(table.positionX),
      positionY: table.positionY === null || table.positionY === undefined
        ? null
        : Number(table.positionY),
      width: table.width === null || table.width === undefined
        ? null
        : Number(table.width),
      height: table.height === null || table.height === undefined
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
      pax: reservation.pax,
      note: reservation.note ?? null,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
