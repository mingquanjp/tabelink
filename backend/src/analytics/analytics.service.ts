import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { AuthRole } from '../auth/auth.constants';
import { JwtPayload } from '../auth/auth.types';
import { MenuItem } from '../entities/menu-item.entity';
import { Restaurant } from '../entities/restaurant.entity';

interface TopMenuRow {
  itemid: number | string;
  restaurantid: number | string;
  namevn: string;
  namejp: string;
  imageurl: string | null;
  ordercount: number | string;
}

interface RestaurantViewRow {
  restaurantid: number | string;
  statdate: string;
  visitcount: number | string;
  japanesevisitcount: number | string;
}

interface MenuItemViewRow {
  itemid: number | string;
  statdate: string;
  viewcount: number | string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
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

  async recordRestaurantView(restaurantId: number, isJapaneseVisitor = false) {
    const restaurant = await this.restaurantRepo.findOne({
      where: {
        restaurantId,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }

    const japaneseVisitIncrement = isJapaneseVisitor ? 1 : 0;
    const rows = await this.dataSource.query<RestaurantViewRow[]>(
      `
        INSERT INTO RESTAURANT_ANALYTICS_DAILY (
          RestaurantID,
          StatDate,
          VisitCount,
          JapaneseVisitCount
        )
        VALUES ($1, CURRENT_DATE, 1, $2)
        ON CONFLICT (RestaurantID, StatDate)
        DO UPDATE SET
          VisitCount = RESTAURANT_ANALYTICS_DAILY.VisitCount + 1,
          JapaneseVisitCount = RESTAURANT_ANALYTICS_DAILY.JapaneseVisitCount + EXCLUDED.JapaneseVisitCount
        RETURNING
          RestaurantID,
          StatDate::text AS StatDate,
          VisitCount,
          JapaneseVisitCount
      `,
      [restaurantId, japaneseVisitIncrement],
    );

    const row = rows[0];

    return {
      restaurantId: Number(row.restaurantid),
      statDate: row.statdate,
      visitCount: Number(row.visitcount),
      japaneseVisitCount: Number(row.japanesevisitcount),
    };
  }

  async recordMenuItemView(itemId: number) {
    const menuItem = await this.menuItemRepo.findOne({
      where: {
        itemId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    if (!menuItem) {
      throw new NotFoundException('Active menu item not found.');
    }

    const rows = await this.dataSource.query<MenuItemViewRow[]>(
      `
        INSERT INTO MENU_ITEM_ANALYTICS_DAILY (
          ItemID,
          StatDate,
          ViewCount
        )
        VALUES ($1, CURRENT_DATE, 1)
        ON CONFLICT (ItemID, StatDate)
        DO UPDATE SET
          ViewCount = MENU_ITEM_ANALYTICS_DAILY.ViewCount + 1
        RETURNING
          ItemID,
          StatDate::text AS StatDate,
          ViewCount
      `,
      [itemId],
    );

    const row = rows[0];

    return {
      itemId: Number(row.itemid),
      statDate: row.statdate,
      viewCount: Number(row.viewcount),
    };
  }

  private async assertOwnerRestaurant(restaurantId: number, user: JwtPayload) {
    if (user.role !== AuthRole.Owner) {
      throw new ForbiddenException(
        'Only restaurant owners can view analytics.',
      );
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
