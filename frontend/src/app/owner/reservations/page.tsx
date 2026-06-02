"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnnouncementsPanel } from "@/components/owner/reservations/AnnouncementsPanel";
import { FloorMap } from "@/components/owner/reservations/FloorMap";
import { ReservationsHeader } from "@/components/owner/reservations/ReservationsHeader";
import { ReservationsTable } from "@/components/owner/reservations/ReservationsTable";
import { StatsCards } from "@/components/owner/reservations/StatsCards";
import {
    createOwnerTable,
    deleteOwnerTable,
    getOwnerReservations,
    getOwnerTables,
    updateOwnerReservation,
    updateOwnerTableStatus,
    type ReservationDto,
    type ReservationStatus,
    type RestaurantTableDto,
    type RestaurantTableStatus,
} from "@/lib/api/owner/reservation/api";
import {
    readSessionCache,
    SESSION_CACHE_TTL,
    writeSessionCache,
} from "@/lib/api/cache";
import { getAuthSession, requireOwnerRestaurant } from "@/lib/api/auth/session";
import { OWNER_TOAST_MESSAGES, showErrorToast } from "@/lib/app-toast";

const ownerReservationsCacheKey = "tabelink:owner:reservations:v1";
const DEFAULT_NEW_TABLE_CAPACITY = 4;
const DEFAULT_NEW_TABLE_WIDTH = 171;
const DEFAULT_NEW_TABLE_HEIGHT = 96;

type OwnerReservationsCache = {
    restaurantId: number;
    tables: RestaurantTableDto[];
    reservations: ReservationDto[];
};

function getNextTableName(tables: RestaurantTableDto[]) {
    const existingNames = new Set(
        tables.map((table) => table.tableName.trim().toLowerCase())
    );
    let tableNumber = tables.length + 1;

    while (existingNames.has(`table ${tableNumber}`.toLowerCase())) {
        tableNumber += 1;
    }

    return `Table ${tableNumber}`;
}

export default function OwnerReservationsPage() {
    const hasInitialSessionCache = useRef(false);
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [tables, setTables] = useState<RestaurantTableDto[]>([]);
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useLayoutEffect(() => {
        const cached = readSessionCache<OwnerReservationsCache>(
            ownerReservationsCacheKey,
            SESSION_CACHE_TTL.reservations,
        );

        if (cached) {
            queueMicrotask(() => {
                hasInitialSessionCache.current = true;
                setRestaurantId(cached.restaurantId);
                setTables(cached.tables);
                setReservations(cached.reservations);
                setIsLoading(false);
            });
        }
    }, []);

    const loadData = useCallback(async () => {
        if (!hasInitialSessionCache.current) {
            setIsLoading(true);
        }

        setErrorMessage(null);

        try {
            const session = await getAuthSession();
            const restaurant = requireOwnerRestaurant(session);
            const ownerRestaurantId = restaurant.restaurantId;
            const [tableResponse, reservationResponse] = await Promise.all([
                getOwnerTables(ownerRestaurantId),
                getOwnerReservations(ownerRestaurantId),
            ]);

            setRestaurantId(ownerRestaurantId);
            setTables(tableResponse.tables);
            setReservations(reservationResponse.reservations);
            writeSessionCache(ownerReservationsCacheKey, {
                restaurantId: ownerRestaurantId,
                tables: tableResponse.tables,
                reservations: reservationResponse.reservations,
            });
        } catch (error) {
            if (hasInitialSessionCache.current) {
                return;
            }
            setErrorMessage(error instanceof Error ? error.message : "予約データを取得できませんでした");
        } finally {
            if (!hasInitialSessionCache.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadData();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadData]);

    async function handleTableStatusChange(tableId: number, status: RestaurantTableStatus) {
        if (restaurantId === null) {
            return;
        }

        try {
            setErrorMessage(null);
            const updatedTable = await updateOwnerTableStatus(restaurantId, tableId, status);

            setTables((currentTables) => {
                const nextTables = currentTables.map((table) => (table.tableId === tableId ? updatedTable : table));

                writeSessionCache(ownerReservationsCacheKey, {
                    restaurantId,
                    tables: nextTables,
                    reservations,
                });

                return nextTables;
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "テーブルの状態を更新できませんでした");
        }
    }

    async function handleAddTable() {
        if (restaurantId === null) {
            return;
        }

        try {
            setErrorMessage(null);
            const newTable = await createOwnerTable(restaurantId, {
                tableName: getNextTableName(tables),
                capacity: DEFAULT_NEW_TABLE_CAPACITY,
                status: "Empty",
                width: DEFAULT_NEW_TABLE_WIDTH,
                height: DEFAULT_NEW_TABLE_HEIGHT,
            });
            const nextTables = [...tables, newTable];

            setTables(nextTables);
            writeSessionCache(ownerReservationsCacheKey, {
                restaurantId,
                tables: nextTables,
                reservations,
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "テーブルを追加できませんでした");
        }
    }

    async function handleDeleteTable(tableId: number) {
        if (restaurantId === null) {
            return;
        }

        try {
            setErrorMessage(null);
            await deleteOwnerTable(restaurantId, tableId);
            const nextTables = tables.filter((table) => table.tableId !== tableId);

            setTables(nextTables);
            writeSessionCache(ownerReservationsCacheKey, {
                restaurantId,
                tables: nextTables,
                reservations,
            });
        } catch {
            showErrorToast(OWNER_TOAST_MESSAGES.deleteTableError);
        }
    }

    async function handleReservationStatusChange(reservationId: number, status: ReservationStatus) {
        if (restaurantId === null) {
            return;
        }

        try {
            setErrorMessage(null);
            const updatedReservation = await updateOwnerReservation(
                restaurantId,
                reservationId,
                { status }
            );

            const nextReservations = reservations.map((reservation) =>
                reservation.reservationId === reservationId ? updatedReservation : reservation
            );

            setReservations(nextReservations);

            const tableResponse = await getOwnerTables(restaurantId);
            setTables(tableResponse.tables);
            writeSessionCache(ownerReservationsCacheKey, {
                restaurantId,
                tables: tableResponse.tables,
                reservations: nextReservations,
            });
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "予約の状態を更新できませんでした");
        }
    }

    return (
        <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-8 pb-20 pt-8">
            <ReservationsHeader searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
            {errorMessage ? (
                <div className="rounded-lg border border-[#ba1a1a33] bg-[#ffdad64c] px-4 py-3 text-sm font-medium text-[#ba1a1a]">
                    {errorMessage}
                </div>
            ) : null}
            {isLoading ? (
                <div className="rounded-lg border border-stone-100 bg-white px-6 py-5 text-sm font-medium text-stone-500 shadow-[0px_1px_2px_#0000000d]">
                    予約データを読み込んでいます
                </div>
            ) : null}
            <StatsCards reservations={reservations} tables={tables} />
            <ReservationsTable
                reservations={reservations}
                searchTerm={searchTerm}
                onStatusChange={handleReservationStatusChange}
            />
            <section className="grid grid-cols-3 gap-8">
                <FloorMap
                    tables={tables}
                    onStatusChange={handleTableStatusChange}
                    onAddTable={handleAddTable}
                    onDeleteTable={handleDeleteTable}
                />
                <AnnouncementsPanel />
            </section>
        </main>
    );
}
