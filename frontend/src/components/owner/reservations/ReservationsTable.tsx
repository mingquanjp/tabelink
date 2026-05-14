"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReservationDto, ReservationStatus } from "@/lib/api/owner/reservation/api";

type ReservationStatusType = "confirmed" | "arrived" | "pending" | "terminal";
type ReservationRequestType = "alert" | "neutral" | "success";
type ReservationActionType = "primary" | "secondary" | "danger-outline";

type ReservationRequest = {
    label: string;
    type: ReservationRequestType;
};

type ReservationAction = {
    label: string;
    type: ReservationActionType;
    nextStatus?: ReservationStatus;
};

type DisplayReservation = {
    id: number;
    time: string;
    date: string;
    initials: string;
    name: string;
    tableLabel: string;
    party: string;
    status: ReservationStatus;
    statusType: ReservationStatusType;
    requests: ReservationRequest[];
    actions: ReservationAction[];
    searchText: string;
    hour: number;
};

const filterTabs = ["すべて", "ランチ", "ディナー"] as const;
type FilterTab = (typeof filterTabs)[number];

const PAGE_SIZE = 4;
type PaginationPageItem = number | "ellipsis-start" | "ellipsis-end";

type ReservationsTableProps = {
    reservations: ReservationDto[];
    searchTerm: string;
    onStatusChange: (reservationId: number, status: ReservationStatus) => Promise<void>;
};

function getStatusClasses(type: ReservationStatusType) {
    if (type === "confirmed") {
        return {
            wrapper: "bg-[#3d5f461a] text-[#3d5f46]",
            dot: "bg-[#3d5f46]",
        };
    }

    if (type === "arrived") {
        return {
            wrapper: "bg-[#af111c1a] text-[#af111c]",
            dot: "bg-[#af111c]",
        };
    }

    if (type === "terminal") {
        return {
            wrapper: "bg-stone-200 text-stone-600",
            dot: "bg-stone-500",
        };
    }

    return {
        wrapper: "bg-stone-100 text-stone-500",
        dot: "bg-stone-400",
    };
}

function getRequestClasses(type: ReservationRequestType) {
    if (type === "alert") {
        return "bg-[#ffdad64c] text-[#ba1a1a]";
    }

    if (type === "success") {
        return "bg-[#3d5f461a] text-[#3d5f46]";
    }

    return "bg-stone-100 text-stone-500";
}

function getActionClasses(type: ReservationActionType) {
    if (type === "primary") {
        return "bg-[#af111c] text-white hover:bg-[#980f19]";
    }

    if (type === "danger-outline") {
        return "border border-[#ba1a1a33] bg-transparent text-[#ba1a1a] hover:bg-[#ba1a1a0a]";
    }

    return "border border-stone-200 bg-transparent text-stone-600 hover:bg-stone-50";
}

function getStatusType(status: ReservationStatus): ReservationStatusType {
    if (status === "Confirmed") {
        return "confirmed";
    }

    if (status === "Arrived") {
        return "arrived";
    }

    if (status === "Completed" || status === "Cancelled") {
        return "terminal";
    }

    return "pending";
}

function getActions(status: ReservationStatus): ReservationAction[] {
    if (status === "Pending") {
        return [
            { label: "承諾", type: "primary", nextStatus: "Confirmed" },
            { label: "キャンセル", type: "danger-outline", nextStatus: "Cancelled" },
        ];
    }

    if (status === "Confirmed") {
        return [{ label: "来店", type: "primary", nextStatus: "Arrived" }];
    }

    if (status === "Arrived") {
        return [{ label: "完了", type: "primary", nextStatus: "Completed" }];
    }

    return [{ label: "詳細表示", type: "secondary" }];
}

function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return "--";
    }

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("");
}

function formatDateTime(value: string) {
    const date = new Date(value);

    return {
        time: new Intl.DateTimeFormat("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(date),
        date: new Intl.DateTimeFormat("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .format(date)
            .replaceAll("/", "."),
        hour: date.getHours(),
    };
}

function toDisplayReservation(reservation: ReservationDto): DisplayReservation {
    const customerName =
        reservation.customer?.displayName || reservation.customer?.fullName || `Customer #${reservation.customerAccountId}`;
    const tableLabel = reservation.table?.tableName
        ? `テーブル ${reservation.table.tableName}`
        : "テーブル未割当";
    const dateTime = formatDateTime(reservation.reservationDateTime);
    const requests: ReservationRequest[] = [
        {
            label: reservation.note?.trim() || "なし",
            type: reservation.note?.trim() ? "success" : "neutral",
        },
    ];

    if (!reservation.tableId) {
        requests.unshift({ label: "席割当前", type: "alert" });
    }

    return {
        id: reservation.reservationId,
        time: dateTime.time,
        date: dateTime.date,
        hour: dateTime.hour,
        initials: getInitials(customerName),
        name: `${customerName} 様`,
        tableLabel,
        party: `${reservation.pax} 名`,
        status: reservation.status,
        statusType: getStatusType(reservation.status),
        requests,
        actions: getActions(reservation.status),
        searchText: `${customerName} ${tableLabel} ${reservation.note ?? ""}`.toLowerCase(),
    };
}

function getPaginationItems(currentPage: number, totalPages: number): PaginationPageItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [
            1,
            "ellipsis-start",
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        "ellipsis-start",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis-end",
        totalPages,
    ];
}

export function ReservationsTable({ reservations, searchTerm, onStatusChange }: ReservationsTableProps) {
    const [activeFilter, setActiveFilter] = useState<FilterTab>(filterTabs[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingReservationId, setUpdatingReservationId] = useState<number | null>(null);
    const displayReservations = useMemo(
        () => reservations.map(toDisplayReservation),
        [reservations]
    );
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredReservations = displayReservations.filter((reservation) => {
        const matchesSearch = normalizedSearch.length === 0 || reservation.searchText.includes(normalizedSearch);

        if (!matchesSearch) {
            return false;
        }

        if (activeFilter === "ランチ") {
            return reservation.hour < 14;
        }

        if (activeFilter === "ディナー") {
            return reservation.hour >= 14;
        }

        return true;
    });
    const totalReservations = filteredReservations.length;
    const totalPages = Math.max(1, Math.ceil(totalReservations / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    const paginatedReservations = filteredReservations.slice(startIndex, startIndex + PAGE_SIZE);
    const startItem = totalReservations === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(startIndex + PAGE_SIZE, totalReservations);
    const paginationItems = getPaginationItems(safeCurrentPage, totalPages);

    async function handleAction(reservationId: number, status?: ReservationStatus) {
        if (!status) {
            return;
        }

        setUpdatingReservationId(reservationId);

        try {
            await onStatusChange(reservationId, status);
        } finally {
            setUpdatingReservationId(null);
        }
    }

    return (
        <section>
            <Card className="overflow-hidden rounded-lg border border-stone-100 bg-white shadow-[0px_1px_2px_#0000000d]">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-stone-50 p-6">
                        <h2 className="font-jp text-lg font-medium leading-7 text-[#1a1c1b]">
                            近日中の予約リスト
                        </h2>

                        <div className="flex items-center gap-2">
                            {filterTabs.map((tab) => {
                                const isActive = tab === activeFilter;

                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => {
                                            setActiveFilter(tab);
                                            setCurrentPage(1);
                                        }}
                                        className={`inline-flex items-center justify-center rounded-xl px-4 py-1.5 font-jp text-xs font-medium leading-4 transition-colors ${
                                            isActive ? "bg-[#af111c1a] text-[#af111c]" : "text-[#5a6053] hover:bg-stone-100"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-0 bg-[#f4f4f180] hover:bg-[#f4f4f180]">
                                    <TableHead className="w-[109px] px-6 py-4 font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        時間
                                    </TableHead>
                                    <TableHead className="w-[323px] px-6 py-4 font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        お客様名
                                    </TableHead>
                                    <TableHead className="w-[109px] px-6 py-4 font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        人数
                                    </TableHead>
                                    <TableHead className="w-[178px] px-6 py-4 font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        ステータス
                                    </TableHead>
                                    <TableHead className="w-[252px] px-6 py-4 font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        特別リクエスト
                                    </TableHead>
                                    <TableHead className="w-[241px] px-6 py-4 text-right font-jp text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        アクション
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedReservations.length === 0 ? (
                                    <TableRow className="border-stone-50 hover:bg-transparent">
                                        <TableCell colSpan={6} className="px-6 py-12 text-center text-sm font-medium text-stone-500">
                                            表示できる予約がありません
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedReservations.map((reservation) => {
                                        const statusStyles = getStatusClasses(reservation.statusType);
                                        const isUpdating = updatingReservationId === reservation.id;

                                        return (
                                            <TableRow
                                                key={reservation.id}
                                                className="border-stone-50 hover:bg-transparent"
                                            >
                                                <TableCell className="px-6 py-5 align-middle">
                                                    <div className="flex flex-col">
                                                        <span className="font-brand text-base font-bold leading-[normal] text-[#1a1c1b]">
                                                            {reservation.time}
                                                        </span>
                                                        <span className="font-manrope text-[10px] font-normal leading-[normal] text-stone-400">
                                                            {reservation.date}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-5 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100">
                                                            <span className="font-manrope text-xs font-bold leading-4 text-stone-400">
                                                                {reservation.initials}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-manrope text-base font-bold leading-[normal] text-[#1a1c1b]">
                                                                {reservation.name}
                                                            </span>
                                                            <span className="font-manrope text-xs font-normal leading-4 text-stone-400">
                                                                {reservation.tableLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-5 align-middle">
                                                    <span className="inline-flex rounded-xl bg-[#dfe5d480] px-3 py-[4.5px] font-manrope text-xs font-bold leading-4 text-[#606659]">
                                                        {reservation.party}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-6 py-5 align-middle">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`gap-1.5 rounded-xl px-3 py-1 font-manrope text-[11px] font-bold leading-[normal] tracking-[0.55px] ${statusStyles.wrapper}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`} />
                                                        {reservation.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="px-6 py-5 align-middle">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {reservation.requests.map((request) => (
                                                            <span
                                                                key={request.label}
                                                                className={`inline-flex rounded-md px-2.5 py-1 font-jp text-[10px] font-medium leading-[normal] ${getRequestClasses(
                                                                    request.type
                                                                )}`}
                                                            >
                                                                {request.label}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-6 py-5 align-middle">
                                                    <div className="flex justify-end gap-2">
                                                        {reservation.actions.map((action) => (
                                                            <Button
                                                                key={action.label}
                                                                type="button"
                                                                disabled={isUpdating || !action.nextStatus}
                                                                onClick={() => void handleAction(reservation.id, action.nextStatus)}
                                                                className={`h-auto rounded px-4 py-2 font-jp text-xs font-medium leading-4 shadow-none disabled:cursor-wait disabled:opacity-60 ${getActionClasses(
                                                                    action.type
                                                                )}`}
                                                            >
                                                                {action.label}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-50 p-6">
                        <p className="font-manrope text-xs font-normal leading-4 text-[#5a6053]">
                            全 {totalReservations} 件中 {startItem}-{endItem} 件を表示
                        </p>

                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent className="gap-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        text=""
                                        aria-disabled={safeCurrentPage === 1}
                                        className={`${safeCurrentPage === 1 ? "pointer-events-none opacity-50" : ""} [&_span]:hidden`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCurrentPage(Math.max(1, safeCurrentPage - 1));
                                        }}
                                    />
                                </PaginationItem>

                                {paginationItems.map((item) => {
                                    if (typeof item === "string") {
                                        return (
                                            <PaginationItem key={item}>
                                                <span className="flex h-9 w-9 items-center justify-center text-sm font-medium text-stone-400">
                                                    ...
                                                </span>
                                            </PaginationItem>
                                        );
                                    }

                                    return (
                                        <PaginationItem key={item}>
                                            <PaginationLink
                                                href="#"
                                                isActive={safeCurrentPage === item}
                                                className={
                                                    safeCurrentPage === item
                                                        ? "border-[#af111c] bg-[#af111c] text-white hover:bg-[#980f19] hover:text-white"
                                                        : "text-stone-600"
                                                }
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    setCurrentPage(item);
                                                }}
                                            >
                                                {item}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        text=""
                                        aria-disabled={safeCurrentPage === totalPages}
                                        className={`${safeCurrentPage === totalPages ? "pointer-events-none opacity-50" : ""} [&_span]:hidden`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCurrentPage(Math.min(totalPages, safeCurrentPage + 1));
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
