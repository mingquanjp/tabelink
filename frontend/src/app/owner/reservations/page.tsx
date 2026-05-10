"use client";

import { useCallback, useEffect, useState } from "react";
import { AnnouncementsPanel } from "@/components/owner/reservations/AnnouncementsPanel";
import { FloorMap } from "@/components/owner/reservations/FloorMap";
import { ReservationsHeader } from "@/components/owner/reservations/ReservationsHeader";
import { ReservationsTable } from "@/components/owner/reservations/ReservationsTable";
import { StatsCards } from "@/components/owner/reservations/StatsCards";
import {
    getOwnerReservations,
    getOwnerTables,
    updateOwnerReservation,
    updateOwnerTableStatus,
    type ReservationDto,
    type ReservationStatus,
    type RestaurantTableDto,
    type RestaurantTableStatus,
} from "@/lib/api/owner/reservation/api";

const TEST_RESTAURANT_ID = Number(process.env.NEXT_PUBLIC_TEST_RESTAURANT_ID ?? "1001");

export default function OwnerReservationsPage() {
    const [restaurantId, setRestaurantId] = useState<number | null>(null);
    const [tables, setTables] = useState<RestaurantTableDto[]>([]);
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const [tableResponse, reservationResponse] = await Promise.all([
                getOwnerTables(TEST_RESTAURANT_ID),
                getOwnerReservations(TEST_RESTAURANT_ID),
            ]);

            setRestaurantId(TEST_RESTAURANT_ID);
            setTables(tableResponse.tables);
            setReservations(reservationResponse.reservations);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "予約データを取得できませんでした");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        window.setTimeout(() => {
            void loadData();
        }, 0);
    }, [loadData]);

    async function handleTableStatusChange(tableId: number, status: RestaurantTableStatus) {
        if (restaurantId === null) {
            return;
        }

        try {
            setErrorMessage(null);
            const updatedTable = await updateOwnerTableStatus(restaurantId, tableId, status);

            setTables((currentTables) =>
                currentTables.map((table) => (table.tableId === tableId ? updatedTable : table))
            );
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "テーブルの状態を更新できませんでした");
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

            setReservations((currentReservations) =>
                currentReservations.map((reservation) =>
                    reservation.reservationId === reservationId ? updatedReservation : reservation
                )
            );

            const tableResponse = await getOwnerTables(restaurantId);
            setTables(tableResponse.tables);
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
                <FloorMap tables={tables} onStatusChange={handleTableStatusChange} />
                <AnnouncementsPanel />
            </section>
        </main>
    );
}
