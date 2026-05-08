"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    name: string;
    status: string;
    type: FloorTableType;
    menu?: boolean;
};

type TableStatusOption = {
    label: string;
    type: FloorTableType;
    dotClass: string;
    textClass: string;
};

const statusOptions: TableStatusOption[] = [
    { label: "空席", type: "available", dotClass: "bg-emerald-500", textClass: "text-emerald-600" },
    { label: "使用中", type: "occupied", dotClass: "bg-[#3d5f46]", textClass: "text-[#3d5f46]" },
    { label: "予約済", type: "reserved", dotClass: "bg-[#af111c66]", textClass: "text-[#af111c]" },
];

const floorLegend: FloorLegendItem[] = [
    { label: "使用中", dotClass: "bg-[#3d5f46] border-[#3d5f46]" },
    { label: "空席", dotClass: "bg-white border-stone-200" },
    { label: "予約済", dotClass: "bg-[#af111c33] border-[#af111c33]" },
];

const floorTables: FloorTable[] = [
    { name: "TABLE 01", status: "使用中", type: "occupied" },
    { name: "TABLE 02", status: "空席", type: "available", menu: true },
    { name: "TABLE 03", status: "予約済", type: "reserved" },
    { name: "TABLE 04", status: "使用中", type: "occupied" },
    { name: "TABLE 05", status: "使用中", type: "occupied" },
    { name: "TABLE 06", status: "空席", type: "available" },
];

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

export function FloorMap() {
    const [tableStatuses, setTableStatuses] = useState<Record<string, FloorTableType>>(() =>
        floorTables.reduce<Record<string, FloorTableType>>((acc, table) => {
            acc[table.name] = table.type;
            return acc;
        }, {})
    );

    return (
        <Card className="col-span-2 rounded-lg border-0 bg-[#f4f4f1] shadow-none">
            <CardContent className="p-8">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="[font-family:'Noto_Sans_JP-Medium',Helvetica] text-xl font-medium leading-7 text-[#1a1c1b]">
                        フロアマップ状況
                    </h2>

                    <div className="flex items-center gap-4">
                        {floorLegend.map((item) => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <span className={`h-2.5 w-2.5 rounded-sm border ${item.dotClass}`} />
                                <span className="[font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 text-[#1a1c1b]">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border-2 border-dashed border-stone-200 bg-[#ffffff66] px-12 py-11">
                    <div className="mx-auto grid max-w-2xl grid-cols-3 gap-8">
                        {floorTables.map((table) => {
                            const tableType = tableStatuses[table.name] ?? table.type;
                            const styles = getTableClasses(tableType);
                            const activeOption = statusOptions.find((option) => option.type === tableType);
                            const statusLabel = activeOption?.label ?? table.status;

                            return (
                                <article key={table.name} className="relative">
                                    <div
                                        className={`flex h-24 flex-col items-center justify-center rounded border shadow-[0px_1px_2px_#0000000d] ${styles.card}`}
                                    >
                                        <span
                                            className={`[font-family:'Manrope-Bold',Helvetica] text-[10px] font-bold leading-[15px] ${styles.sub}`}
                                        >
                                            {table.name}
                                        </span>
                                        <span
                                            className={`[font-family:'Noto_Sans_JP-Medium',Helvetica] text-base font-medium leading-6 ${styles.main}`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                aria-label={`${table.name} status`}
                                                className="absolute right-2 top-2 inline-flex h-7 items-center gap-1 rounded border border-stone-200 bg-white/90 px-2 text-[10px] font-medium text-stone-700 shadow-sm"
                                            >
                                                <span className={`h-1.5 w-1.5 rounded-full ${activeOption?.dotClass ?? "bg-stone-300"}`} />
                                                <ChevronDown className="h-3 w-3 text-stone-400" />
                                                <span className="sr-only">{statusLabel}</span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32">
                                            {statusOptions.map((option) => (
                                                <DropdownMenuItem
                                                    key={option.type}
                                                    className="flex items-center gap-2 text-xs"
                                                    onSelect={() =>
                                                        setTableStatuses((prev) => ({
                                                            ...prev,
                                                            [table.name]: option.type,
                                                        }))
                                                    }
                                                >
                                                    <span className={`h-2 w-2 rounded-full ${option.dotClass}`} />
                                                    <span className={`font-medium ${option.textClass}`}>{option.label}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
