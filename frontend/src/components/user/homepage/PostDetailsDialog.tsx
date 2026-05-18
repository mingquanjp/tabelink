"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart,
  MessageCircle,
  Share2,
  X
} from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  type HomepageComment,
  type HomepagePost,
} from "./homepage-data";
import { HomepageAvatar } from "./HomepageAvatar";
import { RatingDots } from "./RatingDots";

const COMMENT_PREVIEW_LIMIT = 3;

type PostDetailsDialogProps = {
  canFollowAuthor: boolean;
  comments: HomepageComment[];
  commentCount: number;
  currentUserInitials: string;
  isAuthorFollowing: boolean;
  isAuthorFollowPending: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isShared: boolean;
  likeCount: number;
  post: HomepagePost | null;
  onAddComment: (postId: number, text: string) => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onShare: (postId: number) => void;
  onToggleAuthorFollow: (
    accountId: number,
    currentIsFollowing: boolean,
  ) => void;
  onToggleSave: (postId: number) => void;
  onToggleVote: (postId: number) => void;
};

export function PostDetailsDialog({
  canFollowAuthor,
  comments,
  commentCount,
  currentUserInitials,
  isAuthorFollowing,
  isAuthorFollowPending,
  isLiked,
  isSaved,
  isShared,
  likeCount,
  post,
  onAddComment,
  onOpenChange,
  onShare,
  onToggleAuthorFollow,
  onToggleSave,
  onToggleVote,
}: PostDetailsDialogProps) {
  const isVideo = post?.mediaType === "Video";
  const [commentText, setCommentText] = useState("");
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<
    number | null
  >(null);

  const showAllComments = post?.id === expandedCommentsPostId;

  const visibleComments = showAllComments
    ? comments
    : comments.slice(0, COMMENT_PREVIEW_LIMIT);
  const hiddenCommentCount = Math.max(
    0,
    comments.length - visibleComments.length,
  );

  async function handleSubmitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!post) {
      return;
    }

    const trimmedText = commentText.trim();

    if (!trimmedText) {
      return;
    }

    const created = await onAddComment(post.id, trimmedText);

    if (created) {
      setCommentText("");
    }
  }

  return (
    <Dialog
      open={post !== null}
      onOpenChange={(open) => {
        if (!open) {
          setCommentText("");
          setExpandedCommentsPostId(null);
        }

        onOpenChange(open);
      }}
    >
      <DialogContent className="h-[660px] w-[1080px] max-w-[calc(100vw-64px)] overflow-hidden rounded-lg border-0 bg-white p-0 shadow-[0_24px_64px_rgba(26,28,27,0.22)]">
        <DialogTitle className="sr-only">投稿詳細</DialogTitle>
        <DialogDescription className="sr-only">
          レストラン投稿の写真、評価、コメントを表示します。
        </DialogDescription>
        {post ? (
          <div className="grid h-full grid-cols-[minmax(0,1.5fr)_420px]">
            <div className="bg-[#080808]">
              {isVideo ? (
                <video
                  className="h-full w-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                  src={post.image}
                />
              ) : (
                <div
                  className="h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${post.image})` }}
                />
              )}
            </div>
            <aside className="relative flex min-h-0 flex-col bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-[#f0eee8] px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <HomepageAvatar initials={post.initials} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-jp text-[14px] font-semibold leading-5 text-[#1a1c1b]"
                    >
                      {post.author}
                    </p>
                    <p className="font-manrope text-[11px] leading-4 text-[#7a7f74]">
                      {post.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    aria-pressed={isAuthorFollowing}
                    disabled={!canFollowAuthor || isAuthorFollowPending}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-full border-[#af111c] px-4 font-jp text-[11px] font-semibold text-[#af111c] hover:bg-[#af111c0d]"
                    onClick={() => {
                      if (post.authorAccountId) {
                        onToggleAuthorFollow(
                          post.authorAccountId,
                          isAuthorFollowing,
                        );
                      }
                    }}
                  >
                    {isAuthorFollowing ? "フォロー中" : "フォロー"}
                  </Button>
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      aria-label="Close post details"
                      className="size-8 rounded-full bg-[#f0eee8] text-[#5a6053] hover:bg-[#e7e5df]"
                    >
                      <X className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="h-6 rounded-sm border-[#dfe5d4] bg-[#f4f4f1] px-2.5 py-0 font-manrope text-[9px] font-bold leading-4 text-[#5a6053]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="mt-4 font-jp text-[18px] font-bold leading-7 text-[#1a1c1b]">
                  {post.title}
                </h2>
                <p className="mt-3 font-jp text-[13px] font-medium leading-6 text-[#4e554a]">
                  {post.body}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#f0eee8] py-4">
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

                <div
                  className={`mt-5 space-y-3 ${showAllComments
                    ? "max-h-[240px] overflow-y-auto overscroll-contain pr-1"
                    : "overflow-hidden"
                    }`}
                >
                  {visibleComments.map((comment) => (
                    <div key={comment.id} className="flex min-w-0 gap-2">
                      <HomepageAvatar initials={comment.initials} size="sm" />
                      <div className="min-w-0 rounded-lg bg-[#f4f4f1] px-3 py-2">
                        <p className="font-jp text-[11px] font-bold leading-4 text-[#1a1c1b]">
                          {comment.name}
                        </p>
                        <p className="mt-1 break-words font-jp text-[11px] font-medium leading-5 text-[#5a6053]">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {hiddenCommentCount > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-0 font-jp text-[11px] font-semibold text-[#af111c] hover:bg-transparent hover:text-[#8f0e17]"
                      onClick={() => setExpandedCommentsPostId(post.id)}
                    >
                      さらに{hiddenCommentCount}件のコメントを表示
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="sticky bottom-0 z-10 shrink-0 border-t border-[#f0eee8] bg-white px-5 py-4">
                <div className="mb-3 flex items-center justify-between text-[#5a6053]">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium transition-colors ${isLiked ? "text-[#af111c]" : "text-[#5a6053]"
                        }`}
                      aria-pressed={isLiked}
                      onClick={() => onToggleVote(post.id)}
                    >
                      <Heart
                        className={`size-4 ${isLiked ? "fill-[#af111c]" : ""}`}
                      />
                      {likeCount}
                    </button>
                    <span className="inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium">
                      <MessageCircle className="size-4" />
                      {commentCount}
                    </span>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 font-manrope text-[12px] font-medium transition-colors ${isShared ? "text-[#af111c]" : "text-[#5a6053]"
                        }`}
                      onClick={() => onShare(post.id)}
                    >
                      <Share2 className="size-4" />
                      {isShared ? "共有済み" : "共有"}
                    </button>
                  </div>
                </div>
                <form
                  className="flex items-center gap-2"
                  onSubmit={handleSubmitComment}
                >
                  <HomepageAvatar initials={currentUserInitials} size="sm" />
                  <input
                    className="h-9 min-w-0 flex-1 rounded-full bg-[#f4f4f1] px-3 font-jp text-[11px] font-medium text-[#1a1c1b] outline-none placeholder:text-[#9a9f93] focus:ring-2 focus:ring-[#af111c33]"
                    maxLength={240}
                    placeholder="コメントを追加..."
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    className="h-9 bg-[#af111c] px-3 font-jp text-[11px] hover:bg-[#8f0e17]"
                    disabled={!commentText.trim()}
                  >
                    投稿する
                  </Button>
                </form>
              </div>
            </aside>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
