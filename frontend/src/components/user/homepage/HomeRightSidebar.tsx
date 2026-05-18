import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type {
  HomepageRecommendation,
  HomepageReviewer,
  HomepageTopic,
} from "./homepage-data";
import { HomepageAvatar } from "./HomepageAvatar";

type HomeRightSidebarProps = {
  onToggleReviewerFollow: (accountId: number, isFollowing: boolean) => void;
  recommendations: HomepageRecommendation[];
  reviewers: HomepageReviewer[];
  topics: HomepageTopic[];
};

export function HomeRightSidebar({
  onToggleReviewerFollow,
  recommendations,
  reviewers,
  topics,
}: HomeRightSidebarProps) {
  void recommendations;
  const [isReviewerListExpanded, setIsReviewerListExpanded] = useState(false);
  const visibleReviewers = isReviewerListExpanded
    ? reviewers.slice(0, 5)
    : reviewers.slice(0, 2);

  return (
    <aside className="space-y-5 max-lg:hidden">
      <Card className="rounded-lg border-0 bg-white py-0 shadow-[0_8px_24px_rgba(26,28,27,0.06)]">
        <CardHeader className="px-5 pb-0 pt-5">
          <CardTitle className="font-jp text-[15px] font-bold text-[#1a1c1b]">
            おすすめレビュアー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          {visibleReviewers.map((reviewer) => (
            <div key={reviewer.handle} className="flex items-center gap-3">
              <HomepageAvatar initials={reviewer.initials} size="sm" />

              <div className="min-w-0 flex-1">
                <p className="truncate font-jp text-[13px] font-bold leading-5 text-[#1a1c1b]">
                  {/* {reviewer.name} */}
                  <Link href={`/user/profile/${reviewer.accountId}`}>{reviewer.name}</Link>
                </p>
                <p className="truncate font-manrope text-[11px] leading-4 text-[#7a7f74]">
                  {reviewer.meta}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 font-jp text-[11px] font-bold text-[#af111c]"
                onClick={() => {
                  if (reviewer.accountId !== undefined) {
                    onToggleReviewerFollow(
                      reviewer.accountId,
                      Boolean(reviewer.isFollowing),
                    );
                  }
                }}
              >
                {reviewer.isFollowing ? "フォロー中" : "フォロー"}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="mt-2 h-9 w-full rounded border-[#f0eee8] bg-white font-jp text-[12px] text-[#5a6053]"
            onClick={() => setIsReviewerListExpanded((value) => !value)}
          >
            {isReviewerListExpanded ? "閉じる" : "もっと見る"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-0 bg-white py-0 shadow-[0_8px_24px_rgba(26,28,27,0.06)]">
        <CardHeader className="px-5 pb-0 pt-5">
          <CardTitle className="font-jp text-[15px] font-bold text-[#1a1c1b]">
            トレンド・トピック
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          {topics.map((topic) => (
            <button
              key={topic.label}
              type="button"
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex size-6 shrink-0 items-center justify-center text-[#af111c]">
                <Flame className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-jp text-[13px] font-bold text-[#1a1c1b]">
                  {topic.label}
                </span>
                <span className="sr-only">{topic.count}</span>
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
