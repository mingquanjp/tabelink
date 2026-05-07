import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { Restaurant } from '../entities/restaurant.entity';

interface TopMenuRow {
  itemid: number | string;
  restaurantid: number | string;
  namevn: string;
  namejp: string;
  imageurl: string | null;
  ordercount: number | string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    private readonly dataSource: DataSource,
  ) {}

  async getTopMenu(restaurantId: number, user: JwtPayload) {
    await this.assertOwnerRestaurant(restaurantId, user);

    const rows = await this.dataSource.query<TopMenuRow[]>(
      `
        SELECT
          mi.itemid,
          mi.restaurantid,
          mi.namevn,
          mi.namejp,
          mi.imageurl,
          COALESCE(SUM(ri.quantity), 0)::int AS ordercount
        FROM menu_item mi
        INNER JOIN reservation_item ri
          ON ri.itemid = mi.itemid
          AND ri.restaurantid = mi.restaurantid
        INNER JOIN reservation r
          ON r.reservationid = ri.reservationid
          AND r.restaurantid = ri.restaurantid
        WHERE mi.restaurantid = $1
          AND mi.deletedat IS NULL
          AND r.status = 'Completed'
        GROUP BY mi.itemid, mi.restaurantid, mi.namevn, mi.namejp, mi.imageurl
        ORDER BY SUM(ri.quantity) DESC, mi.itemid ASC
        LIMIT 3
      `,
      [restaurantId],
    );

    return {
      restaurantId,
      count: rows.length,
      items: rows.map((row, index) => ({
        rank: index + 1,
        itemId: Number(row.itemid),
        restaurantId: Number(row.restaurantid),
        nameVn: row.namevn,
        nameJp: row.namejp,
        imageUrl: row.imageurl ?? null,
        orderCount: Number(row.ordercount),
      })),
    };
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException('Only restaurant owners can view analytics.');
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

    return restaurant;
  }
}
