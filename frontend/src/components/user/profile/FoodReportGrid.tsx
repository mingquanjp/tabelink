"use client";

import { UserBlogItem } from "@/lib/api/user-profile/type";
import { useEffect, useState } from "react";
// Kiểm tra kỹ đường dẫn các file này
import { getUserFeedPostDetail } from "@/lib/api/user-feed/API";
import { followUserHomeReviewer, unfollowUserHomeReviewer } from "@/lib/api/user-home/API";
import { PostDetailsDialog } from "../homepage/PostDetailsDialog";
import { FoodReportCard } from "./FoodReportCard";

export function FoodReportGrid({ blogs }: { blogs: UserBlogItem[] }) {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [detail, setDetail] = useState<any>(null);

  // Effect lấy dữ liệu chi tiết khi chọn bài blog
  useEffect(() => {
    if (selectedBlogId) {
      getUserFeedPostDetail(selectedBlogId)
        .then((res) => setDetail(res))
        .catch((err) => console.error("API Detail Error:", err));
    } else {
      setDetail(null);
    }
  }, [selectedBlogId]);

  // Hàm chuyển đổi dữ liệu sang định dạng của PostDetailsDialog
  const mapDetailToHomepagePost = (d: any) => {
    if (!d) return null;
    return {
      id: d.blogId,
      author: d.authorName,
      authorAccountId: d.authorAccountId,
      initials: d.authorName?.substring(0, 2).toUpperCase() || "U",
      time: d.createdAt,
      image: d.images?.[0]?.url || d.thumbnailUrl,
      title: d.title,
      body: d.content,
      tags: d.tags || [],
      metrics: {
        taste: d.tasteRating || 0,
        hygiene: d.hygieneRating || 0,
        service: d.serviceRating || 0,
      },
    } as any;
  };

  return (
    <>
      <section className="grid grid-cols-2 gap-8 pt-8 max-md:grid-cols-1">
        {(blogs || []).map((blog) => (
          <FoodReportCard
            key={blog.blogId}
            blog={blog}
            onOpen={(b) => setSelectedBlogId(b.blogId)}
          />
        ))}
      </section>

      {selectedBlogId && (
        <PostDetailsDialog
          post={mapDetailToHomepagePost(detail)}
          open={selectedBlogId !== null}
          onOpenChange={(open) => !open && setSelectedBlogId(null)}
          comments={detail?.comments || []}
          commentCount={detail?.commentsCount || 0}
          likeCount={detail?.likesCount || 0}
          isLiked={detail?.isLiked || false}
          isAuthorFollowing={detail?.isAuthorFollowing || false}
          onToggleAuthorFollow={async (accountId, currentIsFollowing) => {
            if (currentIsFollowing) await unfollowUserHomeReviewer(accountId);
            else await followUserHomeReviewer(accountId);
            const updated = await getUserFeedPostDetail(selectedBlogId);
            setDetail(updated);
          }}
          onToggleVote={async (id) => console.log("Like:", id)}
          onAddComment={async (id, txt) => { console.log(txt); return true; }}
          canFollowAuthor={true}
          currentUserInitials="ME"
          isAuthorFollowPending={false}
          isSaved={false}
          isShared={false}
          onShare={() => { }}
          onToggleSave={() => { }}
        />
      )}
    </>
  );
}