import Link from "next/link";
import { ImagePlus, PencilLine, Star, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { HomepageUser } from "./homepage-data";
import { HomepageAvatar } from "./HomepageAvatar";

type ComposerCardProps = {
  user: HomepageUser;
};

const createPostHref = "/user/blog/create";

export function ComposerCard({ user }: ComposerCardProps) {
  return (
    <Card className="rounded-lg border-[#e7e5df] bg-white py-0 shadow-none">
      <CardContent className="px-4 py-3">
        <div className="flex items-center gap-3">
          <HomepageAvatar avatarUrl={user.avatarUrl} initials={user.initials} />
          <Link
            href={createPostHref}
            className="flex h-11 min-w-0 flex-1 items-center rounded-full bg-[#f4f4f1] px-4 text-left font-jp text-[13px] font-medium text-[#7a7f74] transition-colors hover:bg-[#ecece7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#af111c33]"
          >
            今日のレストラン体験をシェア...
          </Link>
          <Button
            asChild
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-[#7a7f74]"
            aria-label="Create post"
          >
            <Link href={createPostHref}>
              <PencilLine className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#f0eee8] pt-3 max-sm:grid-cols-1">
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
          >
            <Link href={createPostHref}>
              <ImagePlus className="size-4 text-[#af111c]" />
              写真
            </Link>
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
          >
            <Link href={createPostHref}>
              <Utensils className="size-4 text-[#af111c]" />
              チェックイン
            </Link>
          </Button>
          <Button
            asChild
            type="button"
            variant="ghost"
            className="h-8 gap-2 font-jp text-[12px] text-[#5a6053]"
          >
            <Link href={createPostHref}>
              <Star className="size-4 text-[#af111c]" />
              評価
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
