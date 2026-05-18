"use client";

import { getUserFeedPostDetail } from "@/lib/api/user-feed/API";
import { UserFeedPostDetail } from "@/lib/api/user-feed/type";
import { followUserHomeReviewer, unfollowUserHomeReviewer } from "@/lib/api/user-home/API";
import { UserBlogItem } from "@/lib/api/user-profile/type";
import { useEffect, useState } from "react";
import { PostDetailsDialog } from "../homepage/PostDetailsDialog";
import { FoodReportCard } from "./FoodReportCard";

export function FoodReportGrid({ blogs }: { blogs: UserBlogItem[] }) {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserFeedPostDetail | null>(null);

  //  Dữ liệu chi tiết khi chọn bài blog
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
  const mapDetailToHomepagePost = (d: UserFeedPostDetail | null) => {
    if (!d) return null;
    return {
      id: d.blogId,
      author: d.author.name,
      authorAccountId: d.author.accountId,
      initials: d.author.name?.substring(0, 2).toUpperCase() || "U",
      time: d.createdAt,
      image: d.media?.[0]?.mediaUrl || null,
      title: d.title,
      body: d.content,
      tags: d.hashtags?.map(h => h.name) || [],
      metrics: {
        taste: d.ratings.taste || 0,
        hygiene: d.ratings.hygiene || 0,
        service: d.ratings.service || 0,
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
          comments={detail?.comments.map(c => ({
            id: c.commentId.toString(),
            name: c.author.name,
            text: c.content,
            initials: c.author.name.substring(0, 2).toUpperCase(),
          })) || []}
          commentCount={detail?.commentCount || 0}
          likeCount={detail?.likeCount || 0}
          isLiked={detail?.isLiked || false}
          // isAuthorFollowing={detail?.isAuthorFollowing || false}
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