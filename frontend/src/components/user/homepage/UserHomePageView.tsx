"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createUserFeedPostComment,
  getUserFeed,
  getUserFeedPostComments,
  getUserFeedPostDetail,
  likeUserFeedPost,
  unlikeUserFeedPost,
} from "@/lib/api/user-feed/API";
import type {
  UserFeedComment,
  UserFeedPost,
} from "@/lib/api/user-feed/type";
import {
  followUserHomeReviewer,
  getUserHomeAdvertisedRestaurants,
  getUserHomeHotRestaurants,
  getUserHomeProfile,
  getUserHomeSuggestedReviewers,
  getUserHomeTrendingTopics,
  unfollowUserHomeReviewer,
} from "@/lib/api/user-home/API";
import { showErrorToast } from "@/lib/app-toast";
import {
  homepageFeaturedRestaurants,
  homepageRecommendations,
  homepageUser,
  type HomepageComment,
  type HomepageFeaturedRestaurant,
  type HomepageHotRestaurant,
  type HomepagePost,
  type HomepageReviewer,
  type HomepageTopic,
  type HomepageUser,
} from "./homepage-data";
import { ComposerCard } from "./ComposerCard";
import { FeaturedPostCard } from "./FeaturedPostCard";
import { HomeLeftSidebar } from "./HomeLeftSidebar";
import { HomeRightSidebar } from "./HomeRightSidebar";
import { PostCard } from "./PostCard";
import { PostDetailsDialog } from "./PostDetailsDialog";

const fallbackRestaurantImage = homepageFeaturedRestaurants[0]?.image ?? "";
const USER_FEED_PAGE_LIMIT = 10;

function buildInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatRating(value: number) {
  return value.toFixed(1);
}

function formatReviewerMeta(nationality: string | null, followerCount: number) {
  const followerText =
    followerCount >= 1000
      ? `${Number((followerCount / 1000).toFixed(1))}k followers`
      : `${followerCount} followers`;

  return `${nationality ?? "Reviewer"} · ${followerText}`;
}

function formatPostTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  });
}

function mapHomeProfile(profile: Awaited<ReturnType<typeof getUserHomeProfile>>): HomepageUser {
  const name = profile.displayName ?? profile.fullName;

  return {
    ...homepageUser,
    accountId: profile.accountId,
    name,
    handle: profile.handle,
    initials: buildInitials(name),
    avatarUrl: profile.avatarUrl ?? homepageUser.avatarUrl,
    followerCount: profile.followerCount,
    followingCount: profile.followingCount,
  };
}

function mapHotRestaurant(
  restaurant: Awaited<ReturnType<typeof getUserHomeHotRestaurants>>["items"][number],
): HomepageHotRestaurant {
  return {
    name: restaurant.nameJP || restaurant.nameVN,
    image: restaurant.heroImageUrl ?? fallbackRestaurantImage,
    rating: formatRating(restaurant.averageRating),
  };
}

function mapSuggestedReviewer(
  reviewer: Awaited<ReturnType<typeof getUserHomeSuggestedReviewers>>["items"][number],
): HomepageReviewer {
  const name = reviewer.displayName ?? reviewer.fullName;

  return {
    accountId: reviewer.accountId,
    followerCount: reviewer.followerCount,
    name,
    handle: reviewer.handle,
    avatarUrl: reviewer.avatarUrl,
    initials: buildInitials(name),
    meta: formatReviewerMeta(reviewer.nationality, reviewer.followerCount),
    isFollowing: reviewer.isFollowing,
    nationality: reviewer.nationality,
  };
}

function mapTrendingTopic(
  topic: Awaited<ReturnType<typeof getUserHomeTrendingTopics>>["items"][number],
): HomepageTopic {
  const label = topic.name.startsWith("#") ? topic.name : `#${topic.name}`;

  return {
    label,
    count: `${topic.usedCount} posts`,
  };
}

function mapAdvertisedRestaurant(
  restaurant: Awaited<ReturnType<typeof getUserHomeAdvertisedRestaurants>>["items"][number],
): HomepageFeaturedRestaurant {
  return {
    id: restaurant.promotionId,
    restaurantId: restaurant.restaurantId,
    name: restaurant.restaurantNameJP || restaurant.restaurantNameVN,
    eyebrow: "Sponsored",
    description: restaurant.contentJP ?? restaurant.contentVN ?? "",
    image: restaurant.heroImageUrl ?? fallbackRestaurantImage,
    rating: formatRating(restaurant.averageRating),
    reviewCount: String(restaurant.reviewCount),
  };
}

function mapFeedPost(post: UserFeedPost): HomepagePost {
  const image = post.media[0]?.mediaUrl ?? fallbackRestaurantImage;
  const title = post.title ?? post.content.slice(0, 80);

  return {
    id: post.blogId,
    authorAccountId: post.author.accountId,
    author: post.author.name,
    handle: post.author.handle,
    initials: buildInitials(post.author.name),
    time: formatPostTime(post.createdAt),
    restaurant: "TABELINK Community",
    title,
    body: post.content,
    image,
    tags: post.hashtags.map((tag) =>
      tag.name.startsWith("#") ? tag.name : `#${tag.name}`,
    ),
    metrics: {
      hygiene: post.ratings.hygiene ?? 0,
      taste: post.ratings.taste ?? 0,
      service: post.ratings.service ?? 0,
    },
    likes: post.likeCount,
    comments: post.commentCount,
  };
}

function mapFeedComment(comment: UserFeedComment): HomepageComment {
  return {
    id: String(comment.commentId),
    authorAccountId: comment.author.accountId,
    name: comment.author.name,
    text: comment.content,
    initials: buildInitials(comment.author.name),
  };
}

export function UserHomePageView() {
  const feedPageRef = useRef(0);
  const feedHasNextRef = useRef(true);
  const feedLoadingRef = useRef(false);
  const feedSentinelRef = useRef<HTMLDivElement | null>(null);
  const [homeUser, setHomeUser] = useState<HomepageUser>(() => homepageUser);
  const [hotRestaurants, setHotRestaurants] = useState<HomepageHotRestaurant[]>(
    () => [],
  );
  const [featuredRestaurants, setFeaturedRestaurants] = useState<
    HomepageFeaturedRestaurant[]
  >(() => []);
  const [reviewers, setReviewers] = useState<HomepageReviewer[]>(
    () => [],
  );
  const [pendingReviewerIds, setPendingReviewerIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [knownReviewerFollowIds, setKnownReviewerFollowIds] = useState<
    Set<number>
  >(() => new Set());
  const [followedReviewerIds, setFollowedReviewerIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [topics, setTopics] = useState<HomepageTopic[]>(() => []);
  const [posts, setPosts] = useState<HomepagePost[]>(() => []);
  const [feedHasNext, setFeedHasNext] = useState(true);
  const [selectedPost, setSelectedPost] = useState<HomepagePost | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [pendingLikePostIds, setPendingLikePostIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [pendingCommentPostIds, setPendingCommentPostIds] = useState<Set<number>>(
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
  >(() => ({}));

  useEffect(() => {
    let cancelled = false;

    async function loadUserHome() {
      const [
        profileResult,
        hotRestaurantsResult,
        suggestedReviewersResult,
        trendingTopicsResult,
        advertisedRestaurantsResult,
      ] = await Promise.allSettled([
        getUserHomeProfile(),
        getUserHomeHotRestaurants(),
        getUserHomeSuggestedReviewers(),
        getUserHomeTrendingTopics(),
        getUserHomeAdvertisedRestaurants(),
      ]);

      if (cancelled) {
        return;
      }

      if (profileResult.status === "fulfilled") {
        setHomeUser(mapHomeProfile(profileResult.value));
      }

      if (hotRestaurantsResult.status === "fulfilled") {
        setHotRestaurants(hotRestaurantsResult.value.items.map(mapHotRestaurant));
      }

      if (suggestedReviewersResult.status === "fulfilled") {
        const nextReviewers =
          suggestedReviewersResult.value.items.map(mapSuggestedReviewer);

        setReviewers(nextReviewers);
        setKnownReviewerFollowIds(
          new Set(
            nextReviewers
              .map((reviewer) => reviewer.accountId)
              .filter((accountId): accountId is number => accountId !== undefined),
          ),
        );
        setFollowedReviewerIds(
          new Set(
            nextReviewers
              .filter((reviewer) => reviewer.isFollowing)
              .map((reviewer) => reviewer.accountId)
              .filter((accountId): accountId is number => accountId !== undefined),
          ),
        );
      }

      if (trendingTopicsResult.status === "fulfilled") {
        setTopics(trendingTopicsResult.value.items.map(mapTrendingTopic));
      }

      if (advertisedRestaurantsResult.status === "fulfilled") {
        const nextFeaturedRestaurants =
          advertisedRestaurantsResult.value.items.map(mapAdvertisedRestaurant);

        setFeaturedRestaurants(nextFeaturedRestaurants);
        setFeaturedIndex(0);
      }

      if (
        profileResult.status === "rejected" ||
        hotRestaurantsResult.status === "rejected" ||
        suggestedReviewersResult.status === "rejected" ||
        trendingTopicsResult.status === "rejected" ||
        advertisedRestaurantsResult.status === "rejected"
      ) {
        showErrorToast();
      }
    }

    loadUserHome();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadFeedPage = useCallback(
    async (page: number, mode: "replace" | "append") => {
      if (feedLoadingRef.current) {
        return;
      }

      feedLoadingRef.current = true;

      try {
        const feed = await getUserFeed({
          page,
          limit: USER_FEED_PAGE_LIMIT,
        });
        const nextPosts = feed.items.map(mapFeedPost);

        setPosts((current) => {
          if (mode === "replace") {
            return nextPosts;
          }

          const existingPostIds = new Set(current.map((post) => post.id));
          return [
            ...current,
            ...nextPosts.filter((post) => !existingPostIds.has(post.id)),
          ];
        });
        setLikedPostIds((current) => {
          const next = mode === "replace" ? new Set<number>() : new Set(current);

          for (const post of feed.items) {
            if (post.isLiked) {
              next.add(post.blogId);
            } else {
              next.delete(post.blogId);
            }
          }

          return next;
        });
        setCommentsByPostId((current) => {
          const next =
            mode === "replace"
              ? ({} as Record<number, HomepageComment[]>)
              : { ...current };

          for (const post of feed.items) {
            next[post.blogId] = current[post.blogId] ?? [];
          }

          return next;
        });

        feedPageRef.current = feed.pagination.page;
        feedHasNextRef.current = feed.pagination.hasNext;
        setFeedHasNext(feed.pagination.hasNext);
      } catch {
        showErrorToast();
      } finally {
        feedLoadingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadFeedPage(1, "replace");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadFeedPage]);

  useEffect(() => {
    const sentinel = feedSentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry?.isIntersecting ||
          feedLoadingRef.current ||
          !feedHasNextRef.current
        ) {
          return;
        }

        loadFeedPage(feedPageRef.current + 1, "append");
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [feedHasNext, loadFeedPage, posts.length]);

  function getLikeCount(post: HomepagePost) {
    return post.likes;
  }

  function getCommentCount(post: HomepagePost) {
    return post.comments;
  }

  function replaceFeedPost(post: HomepagePost) {
    setPosts((current) =>
      current.map((item) => (item.id === post.id ? post : item)),
    );
    setSelectedPost((current) => (current?.id === post.id ? post : current));
  }

  function setPostLikedState(postId: number, isLiked: boolean) {
    setLikedPostIds((current) => {
      const next = new Set(current);

      if (isLiked) {
        next.add(postId);
      } else {
        next.delete(postId);
      }

      return next;
    });
  }

  function updatePostLikeCount(postId: number, delta: number) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, likes: Math.max(0, post.likes + delta) }
          : post,
      ),
    );
    setSelectedPost((current) =>
      current?.id === postId
        ? { ...current, likes: Math.max(0, current.likes + delta) }
        : current,
    );
  }

  function updatePostCommentCount(postId: number, delta: number) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: Math.max(0, post.comments + delta) }
          : post,
      ),
    );
    setSelectedPost((current) =>
      current?.id === postId
        ? { ...current, comments: Math.max(0, current.comments + delta) }
        : current,
    );
  }

  function setPostCommentCount(postId: number, total: number) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments: Math.max(0, total) } : post,
      ),
    );
    setSelectedPost((current) =>
      current?.id === postId
        ? { ...current, comments: Math.max(0, total) }
        : current,
    );
  }

  async function togglePostVote(postId: number) {
    if (pendingLikePostIds.has(postId)) {
      return;
    }

    const wasLiked = likedPostIds.has(postId);
    const nextIsLiked = !wasLiked;
    const countDelta = nextIsLiked ? 1 : -1;

    setPendingLikePostIds((current) => new Set(current).add(postId));
    setPostLikedState(postId, nextIsLiked);
    updatePostLikeCount(postId, countDelta);

    try {
      const result = wasLiked
        ? await unlikeUserFeedPost(postId)
        : await likeUserFeedPost(postId);

      setPostLikedState(postId, result.isLiked);

      if (result.isLiked !== nextIsLiked) {
        updatePostLikeCount(postId, result.isLiked ? 1 : -1);
      }
    } catch {
      setPostLikedState(postId, wasLiked);
      updatePostLikeCount(postId, -countDelta);
      showErrorToast();
    } finally {
      setPendingLikePostIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  }

  async function addPostComment(postId: number, text: string) {
    const trimmedText = text.trim();

    if (!trimmedText) {
      return false;
    }

    if (pendingCommentPostIds.has(postId)) {
      return false;
    }

    setPendingCommentPostIds((current) => new Set(current).add(postId));

    try {
      const result = await createUserFeedPostComment(postId, {
        content: trimmedText,
      });

      setCommentsByPostId((current) => ({
        ...current,
        [postId]: [
          ...(current[postId] ?? []),
          {
            id: String(result.commentId),
            authorAccountId: undefined,
            name: homeUser.name,
            text: result.content,
            initials: homeUser.initials,
          },
        ],
      }));
      updatePostCommentCount(postId, 1);

      return true;
    } catch {
      showErrorToast();
      return false;
    } finally {
      setPendingCommentPostIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  }

  function createPost(post: HomepagePost) {
    const nextPost = {
      ...post,
      authorAccountId: homeUser.accountId,
    };

    setPosts((current) => [nextPost, ...current]);
    setCommentsByPostId((current) => ({
      ...current,
      [nextPost.id]: [],
    }));
  }

  function updateFollowingCount(delta: number) {
    setHomeUser((current) => {
      if (current.followingCount === undefined) {
        return current;
      }

      return {
        ...current,
        followingCount: Math.max(0, current.followingCount + delta),
      };
    });
  }

  async function refreshHomeProfile() {
    try {
      const profile = await getUserHomeProfile();

      setHomeUser(mapHomeProfile(profile));
    } catch {
      showErrorToast();
    }
  }

  async function refreshSuggestedReviewers() {
    try {
      const response = await getUserHomeSuggestedReviewers();
      const nextReviewers = response.items.map(mapSuggestedReviewer);
      const nextReviewerById = new Map(
        nextReviewers
          .filter((reviewer) => reviewer.accountId !== undefined)
          .map((reviewer) => [reviewer.accountId, reviewer]),
      );

      setReviewers((current) =>
        current.map((reviewer) =>
          reviewer.accountId === undefined
            ? reviewer
            : (nextReviewerById.get(reviewer.accountId) ?? reviewer),
        ),
      );
      setKnownReviewerFollowIds(
        new Set(
          nextReviewers
            .map((reviewer) => reviewer.accountId)
            .filter((accountId): accountId is number => accountId !== undefined),
        ),
      );
      setFollowedReviewerIds(
        new Set(
          nextReviewers
            .filter((reviewer) => reviewer.isFollowing)
            .map((reviewer) => reviewer.accountId)
            .filter((accountId): accountId is number => accountId !== undefined),
        ),
      );
    } catch {
      showErrorToast();
    }
  }

  function updateReviewerFollowState(
    accountId: number,
    isFollowing: boolean,
    options: { followerCountDelta?: number; markKnown?: boolean } = {},
  ) {
    if (options.markKnown ?? true) {
      setKnownReviewerFollowIds((current) => new Set(current).add(accountId));
    }

    setFollowedReviewerIds((current) => {
      const next = new Set(current);

      if (isFollowing) {
        next.add(accountId);
      } else {
        next.delete(accountId);
      }

      return next;
    });
    setReviewers((current) =>
      current.map((reviewer) =>
        reviewer.accountId === accountId
          ? {
              ...reviewer,
              followerCount:
                reviewer.followerCount === undefined
                  ? reviewer.followerCount
                  : Math.max(
                      0,
                      reviewer.followerCount +
                        (options.followerCountDelta ?? 0),
                    ),
              isFollowing,
              meta:
                reviewer.followerCount === undefined
                  ? reviewer.meta
                  : formatReviewerMeta(
                      reviewer.nationality ?? null,
                      Math.max(
                        0,
                        reviewer.followerCount +
                          (options.followerCountDelta ?? 0),
                      ),
                    ),
            }
          : reviewer,
      ),
    );
  }

  async function toggleReviewerFollow(
    accountId: number,
    currentIsFollowing: boolean,
    options: {
      optimisticCount?: boolean;
      refreshProfileAfter?: boolean;
    } = {},
  ) {
    if (pendingReviewerIds.has(accountId)) {
      return;
    }

    const nextIsFollowing = !currentIsFollowing;
    const countDelta = nextIsFollowing ? 1 : -1;
    const optimisticCount = options.optimisticCount ?? true;
    const hasKnownFollowState = knownReviewerFollowIds.has(accountId);

    setPendingReviewerIds((current) => new Set(current).add(accountId));
    updateReviewerFollowState(accountId, nextIsFollowing, {
      followerCountDelta: countDelta,
      markKnown: hasKnownFollowState,
    });

    if (optimisticCount) {
      updateFollowingCount(countDelta);
    }

    try {
      const result = currentIsFollowing
        ? await unfollowUserHomeReviewer(accountId)
        : await followUserHomeReviewer(accountId);

      updateReviewerFollowState(result.accountId, result.isFollowing);
      await refreshSuggestedReviewers();

      if (optimisticCount && result.isFollowing !== nextIsFollowing) {
        updateFollowingCount(result.isFollowing ? 1 : -1);
      }

      if (options.refreshProfileAfter) {
        await refreshHomeProfile();
      }
    } catch {
      updateReviewerFollowState(accountId, currentIsFollowing, {
        followerCountDelta: -countDelta,
        markKnown: hasKnownFollowState,
      });

      if (optimisticCount) {
        updateFollowingCount(-countDelta);
      }

      showErrorToast();
    } finally {
      setPendingReviewerIds((current) => {
        const next = new Set(current);
        next.delete(accountId);
        return next;
      });
    }
  }

  function togglePostAuthorFollow(
    accountId: number,
    currentIsFollowing: boolean,
  ) {
    const hasKnownFollowState = knownReviewerFollowIds.has(accountId);

    return toggleReviewerFollow(accountId, currentIsFollowing, {
      optimisticCount: hasKnownFollowState,
      refreshProfileAfter: !hasKnownFollowState,
    });
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

  async function openPostDetail(post: HomepagePost) {
    setSelectedPost(post);

    const [detailResult, commentsResult] = await Promise.allSettled([
      getUserFeedPostDetail(post.id),
      getUserFeedPostComments(post.id, { page: 1, limit: 20 }),
    ]);

    if (detailResult.status === "fulfilled") {
      const detailPost = mapFeedPost(detailResult.value);

      replaceFeedPost(detailPost);
      setPostLikedState(detailResult.value.blogId, detailResult.value.isLiked);

      if (commentsResult.status === "rejected") {
        setCommentsByPostId((current) => ({
          ...current,
          [detailResult.value.blogId]:
            detailResult.value.comments.map(mapFeedComment),
        }));
      }
    }

    if (commentsResult.status === "fulfilled") {
      setCommentsByPostId((current) => ({
        ...current,
        [post.id]: commentsResult.value.items.map(mapFeedComment),
      }));
      setPostCommentCount(post.id, commentsResult.value.pagination.total);
    }

    if (
      detailResult.status === "rejected" ||
      commentsResult.status === "rejected"
    ) {
      showErrorToast();
    }
  }

  function selectPreviousFeaturedRestaurant() {
    setFeaturedIndex((current) =>
      current === 0 ? featuredRestaurants.length - 1 : current - 1,
    );
  }

  function selectNextFeaturedRestaurant() {
    setFeaturedIndex(
      (current) => (current + 1) % featuredRestaurants.length,
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f9f9f6]">
      <div className="mx-auto grid w-full max-w-[1360px] grid-cols-[280px_minmax(0,1fr)_280px] gap-8 px-8 py-8">
        <HomeLeftSidebar hotRestaurants={hotRestaurants} user={homeUser} />

        <section className="min-w-0 space-y-5">
          <ComposerCard user={homeUser} onCreatePost={createPost} />
          <FeaturedPostCard
            activeIndex={featuredIndex}
            items={featuredRestaurants}
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
              onOpen={openPostDetail}
              onShare={sharePost}
              onToggleSave={togglePostSave}
              onToggleVote={togglePostVote}
            />
          ))}
          {feedHasNext ? (
            <div ref={feedSentinelRef} aria-hidden="true" className="h-px" />
          ) : null}
        </section>

        <HomeRightSidebar
          onToggleReviewerFollow={toggleReviewerFollow}
          recommendations={homepageRecommendations}
          reviewers={reviewers}
          topics={topics}
        />
      </div>

      <PostDetailsDialog
        comments={selectedPost ? (commentsByPostId[selectedPost.id] ?? []) : []}
        commentCount={selectedPost ? getCommentCount(selectedPost) : 0}
        isLiked={selectedPost ? likedPostIds.has(selectedPost.id) : false}
        isSaved={selectedPost ? savedPostIds.has(selectedPost.id) : false}
        isShared={selectedPost ? sharedPostIds.has(selectedPost.id) : false}
        isAuthorFollowPending={
          selectedPost?.authorAccountId
            ? pendingReviewerIds.has(selectedPost.authorAccountId)
            : false
        }
        isAuthorFollowing={
          selectedPost?.authorAccountId
            ? followedReviewerIds.has(selectedPost.authorAccountId)
            : false
        }
        likeCount={selectedPost ? getLikeCount(selectedPost) : 0}
        post={selectedPost}
        canFollowAuthor={Boolean(
          selectedPost?.authorAccountId &&
            selectedPost.authorAccountId !== homeUser.accountId,
        )}
        currentUserInitials={homeUser.initials}
        onAddComment={addPostComment}
        onToggleAuthorFollow={togglePostAuthorFollow}
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
