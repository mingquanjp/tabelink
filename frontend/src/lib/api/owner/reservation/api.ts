import { refreshSession } from "@/lib/api/auth/API";
import { ApiError, apiRequest } from "@/lib/api/client";

type RequestOptions = {
  method?: "GET" | "PATCH" | "POST" | "DELETE";
  body?: unknown;
};

let refreshPromise: Promise<unknown> | null = null;

async function refreshOwnerSession() {
  refreshPromise ??= refreshSession().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export type RestaurantTableStatus = "Empty" | "Using" | "Reserved";

export type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Arrived"
  | "Cancelled"
  | "Completed";

export type OwnerRestaurantResponse = {
  restaurantId: number;
};

export type RestaurantTableDto = {
  tableId: number;
  restaurantId: number;
  tableName: string;
  capacity: number;
  status: RestaurantTableStatus;
  positionX: number | null;
  positionY: number | null;
  width: number | null;
  height: number | null;
  zone: string | null;
};

export type RestaurantTableListResponse = {
  restaurantId: number;
  count: number;
  summary: Record<RestaurantTableStatus, number>;
  tables: RestaurantTableDto[];
};

export type ReservationCustomerDto = {
  accountId: number;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type ReservationDto = {
  reservationId: number;
  restaurantId: number;
  customerAccountId: number;
  customer: ReservationCustomerDto | null;
  tableId: number | null;
  table: RestaurantTableDto | null;
  reservationDateTime: string;
  durationMinutes: number;
  reservationEndDateTime: string;
  pax: number;
  note: string | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ReservationListResponse = {
  restaurantId: number;
  count: number;
  summary: Record<ReservationStatus, number>;
  reservations: ReservationDto[];
};

export type CreateTableRequest = {
  tableName: string;
  capacity: number;
  status?: RestaurantTableStatus;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zone?: string;
};

export type UpdateTableRequest = Partial<CreateTableRequest>;

export type UpdateReservationRequest = {
  status?: ReservationStatus;
  tableId?: number;
  note?: string;
  durationMinutes?: number;
};

async function ownerReservationRequest<T>(
  path: string,
  options: RequestOptions = {}
) {
  const init: RequestInit = {
    method: options.method ?? "GET",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  };

  try {
    return await apiRequest<T>(path, { ...init, auth: true });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    await refreshOwnerSession();
    return apiRequest<T>(path, { ...init, auth: true });
  }
}

// GET /owner/restaurant
export function getOwnerRestaurant() {
  return ownerReservationRequest<OwnerRestaurantResponse>("/owner/restaurant");
}

// GET /owner/restaurants/{restaurantID}/tables
export function getOwnerTables(restaurantId: number) {
  return ownerReservationRequest<RestaurantTableListResponse>(
    `/owner/restaurants/${restaurantId}/tables`
  );
}

// POST /owner/restaurants/{restaurantID}/tables
export function createOwnerTable(restaurantId: number, body: CreateTableRequest) {
  return ownerReservationRequest<RestaurantTableDto>(
    `/owner/restaurants/${restaurantId}/tables`,
    {
      method: "POST",
      body,
    }
  );
}

// PATCH /owner/restaurants/{restaurantID}/tables/{tableID}
export function updateOwnerTable(
  restaurantId: number,
  tableId: number,
  body: UpdateTableRequest
) {
  return ownerReservationRequest<RestaurantTableDto>(
    `/owner/restaurants/${restaurantId}/tables/${tableId}`,
    {
      method: "PATCH",
      body,
    }
  );
}

// PATCH /owner/restaurants/{restaurantID}/tables/{tableID}/status
export function updateOwnerTableStatus(
  restaurantId: number,
  tableId: number,
  status: RestaurantTableStatus
) {
  return ownerReservationRequest<RestaurantTableDto>(
    `/owner/restaurants/${restaurantId}/tables/${tableId}/status`,
    {
      method: "PATCH",
      body: { status },
    }
  );
}

// DELETE /owner/restaurants/{restaurantID}/tables/{tableID}
export function deleteOwnerTable(restaurantId: number, tableId: number) {
  return ownerReservationRequest<{
    deleted: boolean;
    tableId: number;
    restaurantId: number;
  }>(`/owner/restaurants/${restaurantId}/tables/${tableId}`, {
    method: "DELETE",
  });
}

// GET /owner/restaurants/{restaurantID}/reservations
export function getOwnerReservations(restaurantId: number) {
  return ownerReservationRequest<ReservationListResponse>(
    `/owner/restaurants/${restaurantId}/reservations`
  );
}

// GET /owner/restaurants/{restaurantID}/reservations/{reservationID}
export function getOwnerReservation(restaurantId: number, reservationId: number) {
  return ownerReservationRequest<ReservationDto>(
    `/owner/restaurants/${restaurantId}/reservations/${reservationId}`
  );
}

// PATCH /owner/restaurants/{restaurantID}/reservations/{reservationID}
export function updateOwnerReservation(
  restaurantId: number,
  reservationId: number,
  body: UpdateReservationRequest
) {
  return ownerReservationRequest<ReservationDto>(
    `/owner/restaurants/${restaurantId}/reservations/${reservationId}`,
    {
      method: "PATCH",
      body,
    }
  );
}
