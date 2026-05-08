import { Card, CardContent } from "@/components/ui/card";

type Announcement = {
    tag: string;
    title: string;
    time: string;
    borderClass: string;
};

const announcements: Announcement[] = [
    {
        tag: "重要",
        title: "19:00の団体予約（12名）の最終確認が必要です。",
        time: "10分前",
        borderClass: "border-[#af111c]",
    },
    {
        tag: "更新",
        title: "週末のディナータイムがほぼ満席になりました。",
        time: "2時間前",
        borderClass: "border-[#3d5f46]",
    },
    {
        tag: "システム",
        title: "新しいメニュー写真が承認されました。",
        time: "昨日",
        borderClass: "border-[#5a6053]",
    },
];

export function AnnouncementsPanel() {
    return (
        <Card className="rounded-lg border-0 bg-[#e2e3e0] shadow-none">
            <CardContent className="p-8">
                <h2 className="mb-6 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-xl font-medium leading-7 text-[#1a1c1b]">
                    お知らせ
                </h2>

                <div className="flex flex-col gap-4">
                    {announcements.map((item) => (
                        <article key={`${item.tag}-${item.title}`} className={`rounded border-l-4 bg-white p-4 ${item.borderClass}`}>
                            <div className="[font-family:'Noto_Sans_JP-Medium',Helvetica] text-[10px] font-medium leading-[15px] text-[#5a6053]">
                                {item.tag}
                            </div>
                            <p className="mt-1 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-sm font-medium leading-5 text-[#1a1c1b]">
                                {item.title}
                            </p>
                            <div className="pt-1 [font-family:'Noto_Sans_JP-Medium',Helvetica] text-[10px] font-medium leading-[15px] text-stone-400">
                                {item.time}
                            </div>
                        </article>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
