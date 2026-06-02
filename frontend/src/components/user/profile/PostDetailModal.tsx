"use client";

/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { getUserFeedPostDetail } from "@/lib/api/user-feed/API";
import {
  Star
} from "lucide-react";
import { useEffect, useState } from "react";
import type { UserFeedPostDetail } from "@/lib/api/user-feed/type";



function RatingDots({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-3 ${index < value ? "fill-[#af111c] text-[#af111c]" : "fill-[#e2e3e0] text-[#e2e3e0]"}`}
        />
      ))}
    </div>
  );
}

export function PostDetailModal({ blogId, open, onOpenChange }: {
  blogId: number | null,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) {
  const [detail, setDetail] = useState<UserFeedPostDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);

      try {
        const res = await getUserFeedPostDetail(blogId!);
        setDetail(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (open && blogId) {
      void loadDetail();
      return;
    }

    queueMicrotask(() => setDetail(null));
  }, [open, blogId]);

  if (!open) return null;

  // return (
  //   <Dialog open={open} onOpenChange={onOpenChange}>
  //     <DialogContent className="grid h-[min(82vh,760px)] w-[min(1120px,calc(100vw-48px))] max-w-none grid-cols-[minmax(0,1.5fr)_460px] overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-lg:h-[calc(100vh-32px)] max-lg:grid-cols-1">
  //       <DialogTitle className="sr-only">{detail?.title || "Post Details"}</DialogTitle>

  //       <div className="flex min-h-0 items-center justify-center overflow-hidden bg-black max-lg:h-[44vh]">
  //         <img src={detail.images?.[0]?.url || detail.thumbnailUrl}
  //           className="h-full w-full object-contain"
  //           draggable={false}
  //         />
  //       </div>

  //       <section className="flex min-h-0 flex-col bg-white">
  //         <header className="flex shrink-0 items-center gap-5 border-b border-[rgba(228,190,186,0.1)] py-4 pl-4 pr-16">
  //           <div className="flex min-w-0 items-center gap-3">
  //             <div className="size-10 shrink-0 overflow-hidden rounded-xl shadow-[0_0_0_2px_rgba(175,17,28,0.05)]">
  //               <img
  //                 src={profileSummary.avatarUrl}
  //                 alt=""
  //                 className="size-full object-cover"
  //                 draggable={false}
  //               />
  //             </div>
  //             <div className="min-w-0">
  //               <p className="font-manrope text-sm font-bold leading-5 text-[#1a1c1b]">
  //                 Tanaka K.
  //               </p>
  //               <p className="font-jp text-[10px] font-medium leading-[15px] text-[#5a6053]">
  //                 ハノイ在住者 • 2時間前
  //               </p>
  //             </div>
  //           </div>

  //           <button
  //             type="button"
  //             className="shrink-0 rounded-xl border-2 border-[#af111c] px-8 py-2 font-jp text-xs font-medium leading-4 text-[#af111c]"
  //           >
  //             フォロー
  //           </button>
  //         </header>

  //         <div className="min-h-0 flex-1 overflow-y-auto p-5">
  //           <div className="flex flex-col gap-4">
  //             <div className="flex flex-wrap gap-2">
  //               {tags.map((tag) => (
  //                 <span
  //                   key={tag}
  //                   className="rounded-sm bg-[rgba(223,229,212,0.3)] px-2 py-0.5 font-manrope text-[10px] font-bold uppercase leading-[15px] text-[#5a6053]"
  //                 >
  //                   {tag}
  //                 </span>
  //               ))}
  //             </div>

  //             <h2 className="font-jp text-lg font-bold leading-[25px] text-[#1a1c1b]">
  //               {title}
  //             </h2>

  //             <p className="font-jp text-sm font-medium leading-[22.75px] text-[#5b403d]">
  //               {report.description} Không gian sạch sẽ, món ăn rất ngon!
  //             </p>

  //             <div className="grid grid-cols-3 gap-3 border-y border-[rgba(228,190,186,0.1)] py-4">
  //               {ratingRows.map((item) => (
  //                 <div key={item.label} className="flex flex-col gap-1">
  //                   <span className="text-center font-jp text-[10px] font-medium uppercase leading-[15px] text-[#5a6053]">
  //                     {item.label}
  //                   </span>
  //                   <RatingDots value={item.value} />
  //                 </div>
  //               ))}
  //             </div>

  //             <div className="flex flex-col gap-6 pb-4">
  //               {comments.map((comment) => (
  //                 <div key={comment.author} className="flex gap-3">
  //                   <div className="size-8 shrink-0 overflow-hidden rounded-xl bg-[#dfe5d4]">
  //                     <img
  //                       src={comment.avatar}
  //                       alt=""
  //                       className="size-full object-cover"
  //                       draggable={false}
  //                     />
  //                   </div>
  //                   <div className="rounded-bl-2xl rounded-br-2xl rounded-tr-2xl bg-[#f4f4f1] p-3">
  //                     <p className="font-manrope text-xs font-bold leading-4 text-[#1a1c1b]">
  //                       {comment.author}
  //                       <span className="pl-2 font-jp text-[9px] font-medium uppercase text-[#5a6053]">
  //                         {comment.time}
  //                       </span>
  //                     </p>
  //                     <p className="mt-1 font-jp text-xs font-medium leading-[19.5px] text-[#5b403d]">
  //                       {comment.body}
  //                     </p>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         </div>

  //         <footer className="shrink-0 border-t border-[rgba(228,190,186,0.1)] bg-white px-4 py-4">
  //           <div className="flex items-center justify-between px-2">
  //             <div className="flex items-center gap-6">
  //               <button
  //                 type="button"
  //                 className="flex items-center gap-1.5 text-[#5a6053]"
  //               >
  //                 <Heart className="size-5" />
  //                 <span className="font-manrope text-xs font-bold">128</span>
  //               </button>
  //               <button
  //                 type="button"
  //                 className="flex items-center gap-1.5 text-[#5a6053]"
  //               >
  //                 <MessageSquare className="size-5" />
  //                 <span className="font-manrope text-xs font-bold">14</span>
  //               </button>
  //               <button type="button" className="text-[#5a6053]">
  //                 <Share2 className="size-5" />
  //               </button>
  //             </div>
  //             <button type="button" className="text-[#5a6053]">
  //               <Bookmark className="size-5" />
  //             </button>
  //           </div>

  //           <div className="mt-4 flex items-center gap-3">
  //             <div className="size-8 shrink-0 overflow-hidden rounded-xl bg-[#dfe5d4]">
  //               <img
  //                 src={reviewerAvatar}
  //                 alt=""
  //                 className="size-full object-cover"
  //                 draggable={false}
  //               />
  //             </div>
  //             <div className="relative min-w-0 flex-1">
  //               <input
  //                 className="h-10 w-full rounded-xl bg-[#f4f4f1] py-2 pl-4 pr-20 font-jp text-xs font-medium text-[#1a1c1b] outline-none placeholder:text-[rgba(90,96,83,0.5)]"
  //                 placeholder="コメントを追加..."
  //               />
  //               <button
  //                 type="button"
  //                 className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 font-jp text-xs font-medium leading-4 text-[#af111c]"
  //               >
  //                 投稿する
  //                 <Send className="size-3" />
  //               </button>
  //             </div>
  //           </div>
  //         </footer>
  //       </section>

  //       <DialogClose asChild>
  //         <button
  //           type="button"
  //           aria-label="Close post detail"
  //           className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-xl bg-black/10 text-[#1a1c1b] backdrop-blur-sm transition-colors hover:bg-black/15"
  //         >
  //           <X className="size-5" />
  //         </button>
  //       </DialogClose>
  //     </DialogContent>
  //   </Dialog>
  // );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="...">
        {loading ? (
          <div className="p-20 text-center">Đang tải chi tiết bài viết...</div>
        ) : detail ? (
          <>
            {/* 1. Phần hình ảnh: Dùng detail.media hoặc detail.images */}
            <div className="bg-black">
              <img
                src={detail.media[0]?.mediaUrl ?? ""}
                alt={detail.title ?? "Post image"}
                className="..."
              />
            </div>

            <section className="flex flex-col">
              {/* 2. Phần Header: Thông tin người đăng */}
              <header className="...">
                <img
                  src={detail.author.avatarUrl ?? ""}
                  alt=""
                  className="size-10 rounded-xl"
                />
                <div>
                  <p className="font-bold">{detail.author.name}</p>
                  <p className="text-[10px]">{detail.createdAt}</p>
                </div>
              </header>

              {/* 3. Nội dung bài viết */}
              <div className="p-5 overflow-y-auto">
                <h2 className="text-lg font-bold">{detail.title}</h2>
                <p className="mt-2 text-sm">{detail.content}</p>

                {/* Điểm số từ API */}
                <div className="grid grid-cols-3 gap-3 border-y py-4 mt-4">
                  <div className="text-center">
                    <span className="text-[10px]">Vị (Taste)</span>
                    <RatingDots value={detail.ratings.taste ?? 0} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px]">Vệ sinh (Hygiene)</span>
                    <RatingDots value={detail.ratings.hygiene ?? 0} />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px]">Dịch vụ (Service)</span>
                    <RatingDots value={detail.ratings.service ?? 0} />
                  </div>
                </div>

                {/* 4. Danh sách Comment (Reuse dữ liệu từ API detail) */}
                <div className="mt-6">
                  {detail.comments?.map((comment) => (
                    <div key={comment.commentId} className="flex gap-3 mb-4">
                      <img
                        src={comment.author.avatarUrl ?? ""}
                        alt=""
                        className="size-8 rounded-full"
                      />
                      <div className="bg-gray-100 p-3 rounded-xl">
                        <p className="font-bold text-xs">{comment.author.name}</p>
                        <p className="text-xs">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="p-20 text-center">Không thể tải dữ liệu bài viết.</div>
        )}
      </DialogContent>
    </Dialog>
  );

}
