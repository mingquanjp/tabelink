import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HomepagePost } from "./homepage-data";
import { HomepageAvatar } from "./HomepageAvatar";
import { RatingDots } from "./RatingDots";

type PostCardProps = {
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
  likeCount: number;
  post: HomepagePost;
  onOpen: (post: HomepagePost) => void;
  onShare: (postId: number) => void;
  onToggleSave: (postId: number) => void;
  onToggleVote: (postId: number) => void;
};

export function PostCard({
  commentCount,
  isLiked,
  isSaved,
  isShared,
  likeCount,
  post,
  onOpen,
  onShare,
  onToggleSave,
  onToggleVote,
}: PostCardProps) {
  return (
    <Card className="gap-0 rounded-lg border-[#e7e5df] bg-white py-0 shadow-none">
      <CardHeader className="flex-row items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <HomepageAvatar initials={post.initials} />
          <div className="min-w-0">
            <CardTitle className="truncate font-jp text-[14px] font-semibold leading-5 text-[#1a1c1b]">
              {post.author}
            </CardTitle>
            <p className="truncate font-manrope text-[11px] leading-4 text-[#7a7f74]">
              {post.restaurant} · {post.time}
            </p>
          </div>
        </div>
      </CardHeader>

      <button
        type="button"
        className="block h-[328px] w-full bg-[#1a1c1b] bg-cover bg-center text-left max-sm:h-[240px]"
        style={{ backgroundImage: `url(${post.image})` }}
        aria-label={`${post.title} の詳細を見る`}
        onClick={() => onOpen(post)}
      />

      <CardContent className="flex flex-col gap-4 px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-sm border-[#dfe5d4] bg-[#f4f4f1] px-2 py-0.5 font-manrope text-[10px] font-bold leading-4 text-[#5a6053]"
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          <h2 className="font-jp text-[18px] font-bold leading-7 text-[#1a1c1b]">
            {post.title}
          </h2>
          <p className="line-clamp-3 font-jp text-[13px] font-medium leading-6 text-[#5a6053]">
            {post.body}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 border-y border-[#f0eee8] py-3">
          {Object.entries(post.metrics).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <span className="font-jp text-[10px] font-semibold text-[#7a7f74]">
                {key === "hygiene"
                  ? "衛生面"
                  : key === "taste"
                    ? "味"
                    : "サービス"}
              </span>
              <RatingDots value={value} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[#5a6053]">
          <div className="flex items-center gap-4">
            <button
              className={`inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium transition-colors ${
                isLiked ? "text-[#af111c]" : "text-[#5a6053]"
              }`}
              type="button"
              aria-pressed={isLiked}
              onClick={() => onToggleVote(post.id)}
            >
              <Heart className={`size-4 ${isLiked ? "fill-[#af111c]" : ""}`} />
              {likeCount}
            </button>
            <button
              className="inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium"
              type="button"
              onClick={() => onOpen(post)}
            >
              <MessageCircle className="size-4" />
              {commentCount}
            </button>
            <button
              className={`inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium transition-colors ${
                isShared ? "text-[#af111c]" : "text-[#5a6053]"
              }`}
              type="button"
              onClick={() => onShare(post.id)}
            >
              <Share2 className="size-4" />
              {isShared ? "共有済み" : ""}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
