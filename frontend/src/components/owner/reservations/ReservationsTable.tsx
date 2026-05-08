"use client";

import { useEffect, useState } from "react";
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

type ReservationStatusType = "confirmed" | "arrived" | "pending";
type ReservationRequestType = "alert" | "neutral" | "success";
type ReservationActionType = "primary" | "secondary" | "danger-outline";

type ReservationRequest = {
    label: string;
    type: ReservationRequestType;
};

type ReservationAction = {
    label: string;
    type: ReservationActionType;
};

type Reservation = {
    time: string;
    date: string;
    initials: string;
    name: string;
    phone: string;
    party: string;
    status: string;
    statusType: ReservationStatusType;
    requests: ReservationRequest[];
    actions: ReservationAction[];
};

const filterTabs = ["すべて", "ランチ", "ディナー"] as const;
type FilterTab = (typeof filterTabs)[number];

const reservations: Reservation[] = [
    {
        time: "18:30",
        date: "2024.11.24",
        initials: "KS",
        name: "Kenji Sato (佐藤 健二 様)",
        phone: "090-XXXX-1234",
        party: "4 名",
        status: "CONFIRMED",
        statusType: "confirmed",
        requests: [
            { label: "パクチー抜き", type: "alert" },
            { label: "VAT INVOICE", type: "neutral" },
        ],
        actions: [{ label: "確認", type: "primary" }],
    },
    {
        time: "19:00",
        date: "2024.11.24",
        initials: "YI",
        name: "Yuki Ito (伊藤 結衣 様)",
        phone: "080-XXXX-5678",
        party: "2 名",
        status: "ARRIVED",
        statusType: "arrived",
        requests: [{ label: "なし", type: "neutral" }],
        actions: [{ label: "詳細表示", type: "secondary" }],
    },
    {
        time: "19:30",
        date: "2024.11.24",
        initials: "AT",
        name: "Akira Tanaka (田中 彰 様)",
        phone: "070-XXXX-9012",
        party: "6 名",
        status: "PENDING",
        statusType: "pending",
        requests: [{ label: "辛さ控えめ (Low Spice)", type: "success" }],
        actions: [
            { label: "承諾", type: "primary" },
            { label: "キャンセル", type: "danger-outline" },
        ],
    },
    {
        time: "20:15",
        date: "2024.11.24",
        initials: "MM",
        name: "Mari Mori (森 真理 様)",
        phone: "090-XXXX-4433",
        party: "3 名",
        status: "CONFIRMED",
        statusType: "confirmed",
        requests: [{ label: "なし", type: "neutral" }],
        actions: [{ label: "確認", type: "primary" }],
    },    {
        time: "20:15",
        date: "2024.11.24",
        initials: "MM",
        name: "Mari Mori (森 真理 様)",
        phone: "090-XXXX-4433",
        party: "3 名",
        status: "CONFIRMED",
        statusType: "confirmed",
        requests: [{ label: "なし", type: "neutral" }],
        actions: [{ label: "確認", type: "primary" }],
    },    {
        time: "20:15",
        date: "2024.11.24",
        initials: "MM",
        name: "Mari Mori (森 真理 様)",
        phone: "090-XXXX-4433",
        party: "3 名",
        status: "CONFIRMED",
        statusType: "confirmed",
        requests: [{ label: "なし", type: "neutral" }],
        actions: [{ label: "確認", type: "primary" }],
    },
];

const PAGE_SIZE = 4;

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

export function ReservationsTable() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>(filterTabs[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const filteredReservations = reservations;
    const totalReservations = filteredReservations.length;
    const totalPages = Math.max(1, Math.ceil(totalReservations / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedReservations = filteredReservations.slice(startIndex, startIndex + PAGE_SIZE);
    const startItem = totalReservations === 0 ? 0 : startIndex + 1;
    const endItem = Math.min(startIndex + PAGE_SIZE, totalReservations);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return (
        <section>
            <Card className="overflow-hidden rounded-lg border border-stone-100 bg-white shadow-[0px_1px_2px_#0000000d]">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-stone-50 p-6">
                        <h2 className="[font-family:'Noto_Sans_JP-Medium',Helvetica] text-lg font-medium leading-7 text-[#1a1c1b]">
                            近日中の予約リスト
                        </h2>

                        <div className="flex items-center gap-2">
                            {filterTabs.map((tab) => {
                                const isActive = tab === activeFilter;

                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveFilter(tab)}
                                        className={`inline-flex items-center justify-center rounded-xl px-4 py-1.5 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 transition-colors ${
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
                                    <TableHead className="w-[109px] px-6 py-4 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        時間
                                    </TableHead>
                                    <TableHead className="w-[323px] px-6 py-4 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        お客様名
                                    </TableHead>
                                    <TableHead className="w-[109px] px-6 py-4 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        人数
                                    </TableHead>
                                    <TableHead className="w-[178px] px-6 py-4 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        ステータス
                                    </TableHead>
                                    <TableHead className="w-[252px] px-6 py-4 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        特別リクエスト
                                    </TableHead>
                                    <TableHead className="w-[241px] px-6 py-4 text-right [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[1.20px] text-[#5a6053]">
                                        アクション
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedReservations.map((reservation, index) => {
                                    const statusStyles = getStatusClasses(reservation.statusType);
                                    const rowKey = `${reservation.time}-${reservation.name}-${startIndex + index}`;

                                    return (
                                        <TableRow
                                            key={rowKey}
                                            className="border-stone-50 hover:bg-transparent"
                                        >
                                            <TableCell className="px-6 py-5 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="[font-family:'Plus_Jakarta_Sans-Bold',Helvetica] text-base font-bold leading-[normal] text-[#1a1c1b]">
                                                        {reservation.time}
                                                    </span>
                                                    <span className="[font-family:'Manrope-Regular',Helvetica] text-[10px] font-normal leading-[normal] text-stone-400">
                                                        {reservation.date}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-100">
                                                        <span className="[font-family:'Manrope-Bold',Helvetica] text-xs font-bold leading-4 text-stone-400">
                                                            {reservation.initials}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="[font-family:'Manrope-Bold',Helvetica] text-base font-bold leading-[normal] text-[#1a1c1b]">
                                                            {reservation.name}
                                                        </span>
                                                        <span className="[font-family:'Manrope-Regular',Helvetica] text-xs font-normal leading-4 text-stone-400">
                                                            {reservation.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-6 py-5 align-middle">
                                                <span className="inline-flex rounded-xl bg-[#dfe5d480] px-3 py-[4.5px] [font-family:'Manrope-Bold',Helvetica] text-xs font-bold leading-4 text-[#606659]">
                                                    {reservation.party}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-6 py-5 align-middle">
                                                <Badge
                                                    variant="secondary"
                                                    className={`gap-1.5 rounded-xl px-3 py-1 [font-family:'Manrope-Bold',Helvetica] text-[11px] font-bold leading-[normal] tracking-[0.55px] ${statusStyles.wrapper}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`} />
                                                    {reservation.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="px-6 py-5 align-middle">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {reservation.requests.map((request) => (
                                                        <span
                                                            key={request.label}
                                                            className={`inline-flex rounded-md px-2.5 py-1 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-[10px] font-medium leading-[normal] ${getRequestClasses(
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
                                                            className={`h-auto rounded px-4 py-2 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 shadow-none ${getActionClasses(
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
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-50 p-6">
                        <p className="[font-family:'Manrope-Regular',Helvetica] text-xs font-normal leading-4 text-[#5a6053]">
                            全 {totalReservations} 件中 {startItem}-{endItem} 件を表示
                        </p>

                        <Pagination className="mx-0 w-auto justify-end">
                            <PaginationContent className="gap-2">
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        text=""
                                        aria-disabled={currentPage === 1}
                                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} [&_span]:hidden`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCurrentPage((page) => Math.max(1, page - 1));
                                        }}
                                    />
                                </PaginationItem>

                                {pageNumbers.map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === page}
                                            className={
                                                currentPage === page
                                                    ? "border-[#af111c] bg-[#af111c] text-white hover:bg-[#980f19] hover:text-white"
                                                    : "text-stone-600"
                                            }
                                            onClick={(event) => {
                                                event.preventDefault();
                                                setCurrentPage(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        text=""
                                        aria-disabled={currentPage === totalPages}
                                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} [&_span]:hidden`}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setCurrentPage((page) => Math.min(totalPages, page + 1));
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
