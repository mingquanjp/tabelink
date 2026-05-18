"use client";

import { createUserFeedPostComment, getUserFeedPostDetail, likeUserFeedPost, unlikeUserFeedPost } from "@/lib/api/user-feed/API";
import { UserFeedPostDetail } from "@/lib/api/user-feed/type";
import { followUserHomeReviewer, unfollowUserHomeReviewer } from "@/lib/api/user-home/API";
import { resolveApiUrl } from "@/lib/api/client";
import { UserBlogItem } from "@/lib/api/user-profile/type";
import { useState } from "react";
import type { HomepageComment, HomepagePost } from "../homepage/homepage-data";
import { PostDetailsDialog } from "../homepage/PostDetailsDialog";
import { FoodReportCard } from "./FoodReportCard";

type FoodReportGridProps = {
  blogs: UserBlogItem[];
  isFollowingAuthor: boolean;
  onFollowToggle: () => void;
  isMyProfile: boolean;
};

export function FoodReportGrid({ blogs, isFollowingAuthor, onFollowToggle, isMyProfile }: FoodReportGridProps) {
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserFeedPostDetail | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const refreshDetail = async (id: number) => {
    try {
      const updated = await getUserFeedPostDetail(id);
      setDetail(updated);
    } catch (err) {
      console.error("Refresh detail error:", err);
    }
  };

  function openBlogDetail(blogId: number) {
    setSelectedBlogId(blogId);
    setDetail(null);
    void refreshDetail(blogId);
  }

  function closeBlogDetail() {
    setSelectedBlogId(null);
    setDetail(null);
  }

  // Chuyển đổi dữ liệu sang định dạng của PostDetailsDialog
  const mapDetailToHomepagePost = (d: UserFeedPostDetail | null): HomepagePost | null => {
    if (!d) return null;
    return {
      id: d.blogId,
      author: d.author.name,
      authorAccountId: d.author.accountId,
      avatarUrl: resolveApiUrl(d.author.avatarUrl),
      handle: d.author.handle,
      initials: d.author.name?.substring(0, 2).toUpperCase() || "U",
      time: d.createdAt,
      restaurant: "",
      image: resolveApiUrl(d.media?.[0]?.mediaUrl) || "",
      title: d.title ?? "",
      body: d.content,
      tags: d.hashtags?.map(h => h.name) || [],
      metrics: {
        taste: d.ratings.taste || 0,
        hygiene: d.ratings.hygiene || 0,
        service: d.ratings.service || 0,
      },
      likes: d.likeCount,
      comments: d.commentCount,
    };
  };

  const mapDetailComments = (): HomepageComment[] =>
    detail?.comments.map(c => ({
      id: c.commentId.toString(),
      authorAccountId: c.author.accountId,
      avatarUrl: resolveApiUrl(c.author.avatarUrl),
      name: c.author.name,
      text: c.content,
      initials: c.author.name.substring(0, 2).toUpperCase(),
    })) || [];

  return (
    <>
      <section className="grid grid-cols-2 gap-8 pt-8 max-md:grid-cols-1">
        {(blogs || []).map((blog) => (
          <FoodReportCard
            key={blog.blogId}
            blog={blog}
            onOpen={(b) => openBlogDetail(b.blogId)}
          />
        ))}
      </section>

      {selectedBlogId && (
        <PostDetailsDialog
          post={mapDetailToHomepagePost(detail)}
          onOpenChange={(open) => !open && closeBlogDetail()}
          comments={mapDetailComments()}
          commentCount={detail?.commentCount || 0}
          likeCount={detail?.likeCount || 0}
          isLiked={detail?.isLiked || false}
          isAuthorFollowing={isFollowingAuthor}
          isAuthorFollowPending={isFollowLoading}
          canFollowAuthor={!isMyProfile}
          onToggleAuthorFollow={async (accountId) => {
            if (isFollowLoading) return;
            setIsFollowLoading(true);
            try {
              if (isFollowingAuthor) await unfollowUserHomeReviewer(accountId);
              else await followUserHomeReviewer(accountId);
              onFollowToggle();
            } catch {
              alert("Follow operation failed");
            } finally {
              setIsFollowLoading(false);
            }
          }}

          // XỬ LÝ LIKE (VOTE)
          onToggleVote={async (blogId) => {
            try {
              if (detail?.isLiked) await unlikeUserFeedPost(blogId);
              else await likeUserFeedPost(blogId);
              await refreshDetail(blogId); // Update like count và icon
            } catch (err) {
              console.error("Like error:", err);
            }
          }}
          // XỬ LÝ COMMENT
          onAddComment={async (blogId, text) => {
            try {
              await createUserFeedPostComment(blogId, { content: text });
              await refreshDetail(blogId); // Update danh sách comment mới
              return true;
            } catch (err) {
              console.error("Comment error:", err);
              return false;
            }
          }}
          currentUserInitials="ME"
          isSaved={false}
          isShared={false}
          onShare={() => { }}
          onToggleSave={() => { }}
        />
      )}
    </>
  );
}
