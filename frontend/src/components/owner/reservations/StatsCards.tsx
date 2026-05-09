import { CalendarDays, Clock3, Users, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCard = {
    title: string;
    value: string;
    suffix: string;
    icon: LucideIcon;
    iconWrapperClass: string;
    iconClass: string;
};

const statCards: StatCard[] = [
    {
        title: "本日の予約",
        value: "24",
        suffix: "件",
        icon: CalendarDays,
        iconWrapperClass: "bg-[#af111c1a]",
        iconClass: "text-[#af111c]",
    },
    {
        title: "合計人数",
        value: "86",
        suffix: "名",
        icon: Users,
        iconWrapperClass: "bg-[#3d5f461a]",
        iconClass: "text-[#3d5f46]",
    },
    {
        title: "確認待ち",
        value: "5",
        suffix: "件",
        icon: Clock3,
        iconWrapperClass: "bg-[#dfe5d4]",
        iconClass: "text-[#606659]",
    },
    {
        title: "空席状況",
        value: "12",
        suffix: "席",
        icon: Utensils,
        iconWrapperClass: "bg-stone-100",
        iconClass: "text-stone-500",
    },
];

export function StatsCards() {
    return (
        <section className="grid grid-cols-4 gap-6">
            {statCards.map((item) => {
                const Icon = item.icon;

                return (
                    <Card
                        key={item.title}
                        className="rounded-lg border border-stone-100 bg-white shadow-[0px_1px_2px_#0000000d]"
                    >
                        <CardContent className="flex h-[98px] items-center gap-4 p-6">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconWrapperClass}`}>
                                <Icon className={`h-5 w-5 ${item.iconClass}`} />
                            </div>

                            <div className="flex flex-col">
                                <span className="[font-family:'Noto_Sans_JP-Medium',Helvetica] text-xs font-medium leading-4 tracking-[0.60px] text-[#5a6053]">
                                    {item.title}
                                </span>
                                <div className="flex items-end">
                                    <span className="[font-family:'Plus_Jakarta_Sans-Bold',Helvetica] text-2xl font-bold leading-8 text-[#1a1c1b]">
                                        {item.value}
                                    </span>
                                    <span className="ml-px mb-[3px] [font-family:'Noto_Sans_JP-Medium',Helvetica] text-sm font-medium leading-[13px] text-[#5a6053]">
                                        {item.suffix}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}
