import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type ReservationsHeaderProps = {
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
};

export function ReservationsHeader({ searchTerm, onSearchTermChange }: ReservationsHeaderProps) {
    return (
        <section className="flex items-end justify-between gap-6">
            <header className="flex flex-col gap-2">
                <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.90px] text-[#1a1c1b]">
                    予約管理
                </h1>
                <p className="font-manrope text-xs font-normal leading-4 tracking-[2.40px] text-[#5a6053]">
                    予約リクエストの概要を確認する
                </p>
            </header>

            <div className="w-64">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-[15px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                    <Input
                        value={searchTerm}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                        placeholder="名前や電話番号で検索"
                        className="h-11 rounded bg-[#f4f4f1] border-0 pl-10 pr-4 font-jp text-sm font-medium text-gray-500 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-stone-300"
                    />
                </div>
            </div>
        </section>
    );
}
