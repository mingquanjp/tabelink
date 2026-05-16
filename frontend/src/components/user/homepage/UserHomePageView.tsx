"use client";

import { useMemo, useState } from "react";
import {
  homepageComments,
  homepageFeaturedRestaurants,
  homepagePosts,
  homepageRecommendations,
  homepageUser,
  type HomepageComment,
  type HomepagePost,
} from "./homepage-data";
import { ComposerCard } from "./ComposerCard";
import { FeaturedPostCard } from "./FeaturedPostCard";
import { HomeLeftSidebar } from "./HomeLeftSidebar";
import { HomeRightSidebar } from "./HomeRightSidebar";
import { PostCard } from "./PostCard";
import { PostDetailsDialog } from "./PostDetailsDialog";

export function UserHomePageView() {
  const [posts, setPosts] = useState<HomepagePost[]>(() => homepagePosts);
  const [selectedPost, setSelectedPost] = useState<HomepagePost | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [sharedPostIds, setSharedPostIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<number, HomepageComment[]>
  >(() =>
    Object.fromEntries(
      homepagePosts.map((post) => [
        post.id,
        homepageComments.map((comment) => ({
          ...comment,
          id: `${post.id}-${comment.id}`,
        })),
      ]),
    ),
  );
  const featuredPost = useMemo(() => homepagePosts[0], []);

  function getLikeCount(post: HomepagePost) {
    return post.likes + (likedPostIds.has(post.id) ? 1 : 0);
  }

  function getCommentCount(post: HomepagePost) {
    const postComments = commentsByPostId[post.id] ?? [];

    return (
      post.comments + Math.max(0, postComments.length - homepageComments.length)
    );
  }

  function togglePostVote(postId: number) {
    setLikedPostIds((current) => {
      const next = new Set(current);

      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return next;
    });
  }

  function addPostComment(postId: number, text: string) {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    setCommentsByPostId((current) => ({
      ...current,
      [postId]: [
        ...(current[postId] ?? []),
        {
          id: `${postId}-${Date.now()}`,
          name: homepageUser.name,
          text: trimmedText,
          initials: homepageUser.initials,
        },
      ],
    }));
  }

  function createPost(post: HomepagePost) {
    setPosts((current) => [post, ...current]);
    setCommentsByPostId((current) => ({
      ...current,
      [post.id]: [],
    }));
  }

  function togglePostSave(postId: number) {
    setSavedPostIds((current) => {
      const next = new Set(current);

      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      return next;
    });
  }

  function sharePost(postId: number) {
    setSharedPostIds((current) => new Set(current).add(postId));
    window.setTimeout(() => {
      setSharedPostIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }, 1800);
  }

  function selectPreviousFeaturedRestaurant() {
    setFeaturedIndex((current) =>
      current === 0 ? homepageFeaturedRestaurants.length - 1 : current - 1,
    );
  }

  function selectNextFeaturedRestaurant() {
    setFeaturedIndex(
      (current) => (current + 1) % homepageFeaturedRestaurants.length,
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6]">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[280px_minmax(0,1fr)_280px] gap-8 px-8 py-8">
        <HomeLeftSidebar user={homepageUser} />

        <section className="min-w-0 space-y-5">
          <ComposerCard user={homepageUser} onCreatePost={createPost} />
          <FeaturedPostCard
            activeIndex={featuredIndex}
            items={homepageFeaturedRestaurants}
            post={featuredPost}
            onOpen={setSelectedPost}
            onSelectNext={selectNextFeaturedRestaurant}
            onSelectPrevious={selectPreviousFeaturedRestaurant}
          />
          {posts.map((post) => (
            <PostCard
              key={post.id}
              commentCount={getCommentCount(post)}
              isLiked={likedPostIds.has(post.id)}
              isSaved={savedPostIds.has(post.id)}
              isShared={sharedPostIds.has(post.id)}
              likeCount={getLikeCount(post)}
              post={post}
              onOpen={setSelectedPost}
              onShare={sharePost}
              onToggleSave={togglePostSave}
              onToggleVote={togglePostVote}
            />
          ))}
        </section>

        <HomeRightSidebar recommendations={homepageRecommendations} />
      </div>

      <PostDetailsDialog
        comments={selectedPost ? (commentsByPostId[selectedPost.id] ?? []) : []}
        commentCount={selectedPost ? getCommentCount(selectedPost) : 0}
        isLiked={selectedPost ? likedPostIds.has(selectedPost.id) : false}
        isSaved={selectedPost ? savedPostIds.has(selectedPost.id) : false}
        isShared={selectedPost ? sharedPostIds.has(selectedPost.id) : false}
        likeCount={selectedPost ? getLikeCount(selectedPost) : 0}
        post={selectedPost}
        onAddComment={addPostComment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPost(null);
          }
        }}
        onShare={sharePost}
        onToggleSave={togglePostSave}
        onToggleVote={togglePostVote}
      />
    </main>
  );
}
