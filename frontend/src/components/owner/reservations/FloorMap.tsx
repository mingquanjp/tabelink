"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RestaurantTableDto, RestaurantTableStatus } from "@/lib/api/owner/reservation/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FloorTableType = "occupied" | "available" | "reserved";

type FloorLegendItem = {
    label: string;
    dotClass: string;
};

type FloorTable = {
    id: number;
    name: string;
    capacity: number;
    status: RestaurantTableStatus;
    type: FloorTableType;
};

type TableStatusOption = {
    label: string;
    backendStatus: RestaurantTableStatus;
    type: FloorTableType;
    dotClass: string;
    textClass: string;
};

const statusOptions: TableStatusOption[] = [
    { label: "空席", backendStatus: "Empty", type: "available", dotClass: "bg-emerald-500", textClass: "text-emerald-600" },
    { label: "使用中", backendStatus: "Using", type: "occupied", dotClass: "bg-[#3d5f46]", textClass: "text-[#3d5f46]" },
    { label: "予約済", backendStatus: "Reserved", type: "reserved", dotClass: "bg-[#af111c66]", textClass: "text-[#af111c]" },
];

const floorLegend: FloorLegendItem[] = [
    { label: "使用中", dotClass: "bg-[#3d5f46] border-[#3d5f46]" },
    { label: "空席", dotClass: "bg-white border-stone-200" },
    { label: "予約済", dotClass: "bg-[#af111c33] border-[#af111c33]" },
];

const TABLE_TILE_WIDTH = 171;
const TABLE_TILE_HEIGHT = 96;
const TABLE_TILE_GAP = 32;

function getTableClasses(type: FloorTableType) {
    if (type === "occupied") {
        return {
            card: "bg-[#3d5f46] border-[#3d5f46] text-white",
            sub: "text-white/60",
            main: "text-white",
            menuDot: "bg-[#3d5f46]",
        };
    }

    if (type === "reserved") {
        return {
            card: "bg-[#af111c1a] border-[#af111c33] text-[#af111c]",
            sub: "text-[#af111c]/60",
            main: "text-[#af111c]",
            menuDot: "bg-[#af111c66]",
        };
    }

    return {
        card: "bg-white border-stone-200 text-stone-600",
        sub: "text-stone-400",
        main: "text-stone-600",
        menuDot: "bg-emerald-500",
    };
}

function toFloorTableType(status: RestaurantTableStatus): FloorTableType {
    if (status === "Using") {
        return "occupied";
    }

    if (status === "Reserved") {
        return "reserved";
    }

    return "available";
}

function toFloorTable(table: RestaurantTableDto): FloorTable {
    return {
        id: table.tableId,
        name: table.tableName,
        capacity: table.capacity,
        status: table.status,
        type: toFloorTableType(table.status),
    };
}

type FloorMapProps = {
    tables: RestaurantTableDto[];
    onStatusChange: (tableId: number, status: RestaurantTableStatus) => Promise<void>;
};

export function FloorMap({ tables, onStatusChange }: FloorMapProps) {
    const [updatingTableId, setUpdatingTableId] = useState<number | null>(null);
    const floorTables = tables.map(toFloorTable);

    async function handleStatusChange(tableId: number, status: RestaurantTableStatus) {
        setUpdatingTableId(tableId);

        try {
            await onStatusChange(tableId, status);
        } finally {
            setUpdatingTableId(null);
        }
    }

    function renderTable(table: FloorTable) {
        const tableType = table.type;
        const styles = getTableClasses(tableType);
        const activeOption = statusOptions.find((option) => option.backendStatus === table.status);
        const statusLabel = activeOption?.label ?? table.status;
        const isUpdating = updatingTableId === table.id;

        return (
            <article
                key={table.id}
                className="relative shrink-0"
                style={{ width: TABLE_TILE_WIDTH, height: TABLE_TILE_HEIGHT }}
            >
                <div
                    className={`flex h-full w-full flex-col items-center justify-center rounded border px-3 text-center shadow-[0px_1px_2px_#0000000d] ${styles.card}`}
                >
                    <span
                        className={`font-manrope text-[10px] font-bold leading-[15px] ${styles.sub}`}
                    >
                        {table.name}
                    </span>
                    <span
                        className={`font-jp text-base font-medium leading-6 ${styles.main}`}
                    >
                        {statusLabel}
                    </span>
                    <span className={`font-manrope text-[10px] leading-4 ${styles.sub}`}>
                        {table.capacity} 名
                    </span>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label={`${table.name} status`}
                            disabled={isUpdating}
                            className="absolute right-[8px] top-[8px] inline-flex h-7 w-7 items-center justify-center rounded text-stone-500 hover:bg-white/60 disabled:cursor-wait disabled:opacity-60"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{statusLabel}</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 px-px py-[5px]">
                        {statusOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.type}
                                className="flex h-9 items-center gap-2 px-4 text-xs"
                                onSelect={() => void handleStatusChange(table.id, option.backendStatus)}
                            >
                                <span className={`h-2 w-2 rounded-full ${option.dotClass}`} />
                                <span className={`font-medium ${option.textClass}`}>{option.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </article>
        );
    }

    return (
        <Card className="col-span-2 rounded-lg border-0 bg-[#f4f4f1] shadow-none">
            <CardContent className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="font-jp text-xl font-medium leading-7 text-[#1a1c1b]">
                        フロアマップ状況
                    </h2>

                    <div className="flex items-center gap-4">
                        {floorLegend.map((item) => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-sm border ${item.dotClass}`} />
                                <span className="font-jp text-xs font-medium leading-4 text-[#1a1c1b]">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border-2 border-dashed border-stone-200 bg-[#ffffff66] p-12">
                    {floorTables.length === 0 ? (
                        <div className="flex min-h-56 items-center justify-center text-sm font-medium text-stone-500">
                            テーブルが登録されていません
                        </div>
                    ) : (
                        <div
                            className="mx-auto grid"
                            style={{
                                gridTemplateColumns: `repeat(3, ${TABLE_TILE_WIDTH}px)`,
                                gap: TABLE_TILE_GAP,
                                width: TABLE_TILE_WIDTH * 3 + TABLE_TILE_GAP * 2,
                            }}
                        >
                            {floorTables.map((table) => renderTable(table))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
