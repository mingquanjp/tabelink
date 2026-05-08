"use client";

import { AnnouncementsPanel } from "../../../components/owner/reservations/AnnouncementsPanel";
import { FloorMap } from "../../../components/owner/reservations/FloorMap";
import { ReservationsHeader } from "../../../components/owner/reservations/ReservationsHeader";
import { ReservationsTable } from "../../../components/owner/reservations/ReservationsTable";
import { StatsCards } from "../../../components/owner/reservations/StatsCards";

export default function OwnerReservationsPage() {
    return (
        <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-8 pb-20 pt-8">
            <ReservationsHeader />
            <StatsCards />
            <ReservationsTable />
            <section className="grid grid-cols-3 gap-8">
                <FloorMap />
                <AnnouncementsPanel />
            </section>
        </main>
    );
}