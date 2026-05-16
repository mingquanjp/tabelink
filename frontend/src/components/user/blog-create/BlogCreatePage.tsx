"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  createBlogTag,
  createRestaurantBlog,
  searchBlogRestaurants,
  uploadBlogMedia,
} from "@/lib/api/blogs/API";
import type { BlogRestaurantSearchItem } from "@/lib/api/blogs/type";
import { PostCreateHeader } from "./PostCreateHeader";
import { MediaUploadSection } from "./MediaUploadSection";
import { RestaurantLinkCard } from "./RestaurantLinkCard";
import { RatingMatrix } from "./RatingMatrix";
import { ReviewTextEditor } from "./ReviewTextEditor";
import { TagSelector } from "./TagSelector";
import {
  defaultRatings,
  defaultTags,
  ratingItems,
  type RatingKey,
} from "./blog-create-data";

function getRestaurantName(restaurant: BlogRestaurantSearchItem) {
  return restaurant.nameJp || restaurant.nameVn;
}

function normalizeTagLabel(value: string) {
  const name = value.trim().replace(/^#+/, "").trim();

  return name ? `#${name}` : "";
}

function uniqueTagLabels(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const label = normalizeTagLabel(value);
    const key = label.toLowerCase();

    if (label && !seen.has(key)) {
      seen.add(key);
      result.push(label);
    }
  }

  return result;
}

export function BlogCreatePage() {
  const [ratings, setRatings] =
    useState<Record<RatingKey, number>>(defaultRatings);
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurantOptions, setRestaurantOptions] = useState<
    BlogRestaurantSearchItem[]
  >([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<BlogRestaurantSearchItem | null>(null);
  const [isRestaurantListOpen, setIsRestaurantListOpen] = useState(false);
  const [isSearchingRestaurants, setIsSearchingRestaurants] = useState(false);
  const [reviewBody, setReviewBody] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedTagNames, setSelectedTagNames] =
    useState<string[]>(defaultTags);
  const [tagInput, setTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const keyword = restaurantQuery.trim();

    if (!keyword) {
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearchingRestaurants(true);
        const response = await searchBlogRestaurants(keyword);

        if (!cancelled) {
          setRestaurantOptions(response.items);
        }
      } catch {
        if (!cancelled) {
          setRestaurantOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingRestaurants(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [restaurantQuery]);

  function handleRatingChange(key: RatingKey, value: number) {
    setRatings((current) => ({ ...current, [key]: value }));
  }

  function handleRestaurantQueryChange(value: string) {
    setRestaurantQuery(value);
    setSelectedRestaurant(null);
    setIsRestaurantListOpen(true);

    if (!value.trim()) {
      setRestaurantOptions([]);
      setIsSearchingRestaurants(false);
    }
  }

  function handleRestaurantSelect(restaurant: BlogRestaurantSearchItem) {
    setSelectedRestaurant(restaurant);
    setRestaurantQuery(getRestaurantName(restaurant));
    setIsRestaurantListOpen(false);
  }

  function handleAddTag() {
    const label = normalizeTagLabel(tagInput);

    if (!label) {
      return;
    }

    setSelectedTagNames((current) => uniqueTagLabels([...current, label]));
    setTagInput("");
    setIsAddingTag(false);
  }

  function handleRemoveTag(tag: string) {
    setSelectedTagNames((current) => current.filter((item) => item !== tag));
  }

  async function handlePublish() {
    if (isPublishing) {
      return;
    }

    const content = reviewBody.trim();

    if (!selectedRestaurant) {
      toast.error("飲食店を選択してください。");
      return;
    }

    if (!content) {
      toast.error("レビュー本文を入力してください。");
      return;
    }

    setIsPublishing(true);

    try {
      const mediaFiles = [photoFile, videoFile].filter(
        (file): file is File => Boolean(file),
      );
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (file, index) => {
          const media = await uploadBlogMedia(
            selectedRestaurant.restaurantId,
            file,
          );

          return {
            mediaUrl: media.mediaUrl,
            mediaType: media.mediaType,
            sortOrder: index,
          };
        }),
      );
      const tagIds = await Promise.all(
        selectedTagNames.map(async (tag) => {
          const createdTag = await createBlogTag(tag);
          return createdTag.tagId;
        }),
      );

      await createRestaurantBlog(selectedRestaurant.restaurantId, {
        content,
        tasteRating: ratings.taste,
        hygieneRating: ratings.hygiene,
        serviceRating: ratings.service,
        media: uploadedMedia.length ? uploadedMedia : undefined,
        tagIds: tagIds.length ? tagIds : undefined,
      });

      toast.success("フードレポートを公開しました。");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "フードレポートの公開に失敗しました。",
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#f9f9f6] text-[#1a1c1b]">
      <PostCreateHeader
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-12 px-4 pb-20 pt-14 md:px-0">
        <section className="flex flex-col gap-2">
          <h1 className="font-jp text-4xl font-medium leading-10 tracking-[-0.9px] text-[#1a1c1b]">
            フードレポート作成
          </h1>
          <p className="font-jp text-base font-medium italic leading-6 text-[#5a6053]">
            ハノイで見つけた最新の食体験を共有しましょう。
          </p>
        </section>

        <section className="flex flex-col gap-12">
          <MediaUploadSection
            photoFile={photoFile}
            videoFile={videoFile}
            onPhotoChange={setPhotoFile}
            onVideoChange={setVideoFile}
          />
          <RestaurantLinkCard
            value={restaurantQuery}
            isOpen={isRestaurantListOpen}
            isSearching={isSearchingRestaurants}
            options={restaurantOptions}
            selectedRestaurantId={selectedRestaurant?.restaurantId}
            onFocus={() => setIsRestaurantListOpen(true)}
            onBlur={() => setIsRestaurantListOpen(false)}
            onChange={handleRestaurantQueryChange}
            onSelect={handleRestaurantSelect}
          />
          <RatingMatrix
            items={ratingItems}
            ratings={ratings}
            onChange={handleRatingChange}
          />
          <ReviewTextEditor value={reviewBody} onChange={setReviewBody} />
          <TagSelector
            tags={selectedTagNames}
            tagInput={tagInput}
            isAddingTag={isAddingTag}
            onTagInputChange={setTagInput}
            onStartAddTag={() => setIsAddingTag(true)}
            onCancelAddTag={() => {
              setIsAddingTag(false);
              setTagInput("");
            }}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />
        </section>
      </div>
    </main>
  );
}
